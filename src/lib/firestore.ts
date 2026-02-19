import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    increment,
    serverTimestamp,
    collection,
    getDocs,
    query,
    orderBy,
    limit,
    Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface UserProfile {
    uid: string;
    displayName: string;
    email: string;
    createdAt: Timestamp;
    totalGamesPlayed: number;
    bestScore: number;
    bestScoreDate: Timestamp | null;
}

export interface QuestionHistoryEntry {
    questionId: number;
    timesCorrect: number;
    timesWrong: number;
    lastSeen: Timestamp;
}

export interface LeaderboardEntry {
    uid: string;
    displayName: string;
    totalScore: number;    // Suma acumulada de todas las partidas Musafir
    bestScore: number;     // Mejor partida individual (referencia)
    gamesPlayed: number;
    updatedAt: Timestamp;
}

// ─── User Profile ─────────────────────────────────────────────────────────────

export async function createUserProfile(
    uid: string,
    displayName: string,
    email: string
): Promise<void> {
    const ref = doc(db, 'users', uid);
    // Solo crear si no existe — no sobrescribir perfiles existentes
    const snap = await getDoc(ref);
    if (!snap.exists()) {
        await setDoc(ref, {
            uid,
            displayName,
            email,
            createdAt: serverTimestamp(),
            totalGamesPlayed: 0,
            bestScore: 0,
            bestScoreDate: null,
        });
    }
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
    const snap = await getDoc(doc(db, 'users', uid));
    if (!snap.exists()) return null;
    return snap.data() as UserProfile;
}

export async function updateDisplayName(uid: string, displayName: string): Promise<void> {
    await updateDoc(doc(db, 'users', uid), { displayName });
    // Sync leaderboard entry
    await updateDoc(doc(db, 'leaderboard', uid), { displayName }).catch(() => {
        // Si no existe entrada en leaderboard todavía, ignorar error
    });
}

// ─── Question History & SRS ───────────────────────────────────────────────────

/**
 * Registra el resultado de responder una pregunta.
 * Usa merge para no sobrescribir campos existentes.
 */
export async function recordQuestionAnswer(
    uid: string,
    questionId: number,
    isCorrect: boolean
): Promise<void> {
    const ref = doc(db, 'users', uid, 'questionHistory', questionId.toString());
    const snap = await getDoc(ref);

    if (!snap.exists()) {
        await setDoc(ref, {
            questionId,
            timesCorrect: isCorrect ? 1 : 0,
            timesWrong: isCorrect ? 0 : 1,
            lastSeen: serverTimestamp(),
        });
    } else {
        await updateDoc(ref, {
            ...(isCorrect ? { timesCorrect: increment(1) } : { timesWrong: increment(1) }),
            lastSeen: serverTimestamp(),
        });
    }
}

/**
 * Obtiene los pesos SRS para un conjunto de IDs de preguntas.
 * 
 * Fórmula de peso:
 *   - timesCorrect >= 3 y timesWrong === 0 → peso 0 (pregunta dominada, excluir)
 *   - default → max(1, timesWrong - timesCorrect + 2)
 * 
 * Las preguntas sin historial tienen peso 2 (neutro, ligeramente priorizadas
 * sobre las dominadas pero igual que una fallada 1 vez).
 * 
 * @returns Map<questionId, weight>
 */
export async function getQuestionWeights(
    uid: string,
    questionIds: number[]
): Promise<Map<number, number>> {
    const weights = new Map<number, number>();

    // Fetch all history docs in parallel (max ~30 preguntas por partida)
    const historyRefs = questionIds.map(id =>
        getDoc(doc(db, 'users', uid, 'questionHistory', id.toString()))
    );
    const snaps = await Promise.all(historyRefs);

    snaps.forEach((snap, i) => {
        const id = questionIds[i];
        if (!snap.exists()) {
            weights.set(id, 2); // Vista por primera vez → peso neutro
            return;
        }
        const { timesCorrect, timesWrong } = snap.data() as QuestionHistoryEntry;

        if (timesCorrect >= 3 && timesWrong === 0) {
            weights.set(id, 0); // Dominada → excluir
        } else {
            weights.set(id, Math.max(1, timesWrong - timesCorrect + 2));
        }
    });

    return weights;
}

/**
 * Selecciona `count` preguntas usando muestreo ponderado (SRS).
 * Las preguntas con peso 0 son excluidas.
 * Las demás son seleccionadas aleatoriamente con probabilidad proporcional a su peso.
 */
export function weightedSample<T extends { id: number }>(
    questions: T[],
    weights: Map<number, number>,
    count: number
): T[] {
    // Separar excluidas vs activas
    const active = questions.filter(q => (weights.get(q.id) ?? 2) > 0);

    if (active.length <= count) return active;

    // Construir tabla de pesos acumulados
    const cumWeights: number[] = [];
    let total = 0;
    for (const q of active) {
        total += weights.get(q.id) ?? 2;
        cumWeights.push(total);
    }

    const selected = new Set<number>();
    const result: T[] = [];

    while (result.length < count && result.length < active.length) {
        const rand = Math.random() * total;
        // Búsqueda binaria del índice
        let lo = 0, hi = cumWeights.length - 1;
        while (lo < hi) {
            const mid = (lo + hi) >> 1;
            if (cumWeights[mid] < rand) lo = mid + 1;
            else hi = mid;
        }
        if (!selected.has(lo)) {
            selected.add(lo);
            result.push(active[lo]);
        }
    }

    return result;
}

// ─── Game Results & Leaderboard ───────────────────────────────────────────────

/**
 * Guarda el resultado de una partida y actualiza la clasificación si es el mejor score.
 */
export async function saveGameResult(
    uid: string,
    displayName: string,
    score: number
): Promise<void> {
    const profileRef = doc(db, 'users', uid);
    const profileSnap = await getDoc(profileRef);

    const currentBest = profileSnap.exists()
        ? (profileSnap.data().bestScore as number) ?? 0
        : 0;

    // Actualizar perfil — siempre sumar partida, actualizar best si mejora
    await updateDoc(profileRef, {
        totalGamesPlayed: increment(1),
        ...(score > currentBest && {
            bestScore: score,
            bestScoreDate: serverTimestamp(),
        }),
    });

    // Actualizar leaderboard — siempre sumar al totalScore acumulado
    const lbRef = doc(db, 'leaderboard', uid);
    const lbSnap = await getDoc(lbRef);
    const currentTotal = lbSnap.exists() ? (lbSnap.data().totalScore as number) ?? 0 : 0;
    const currentLbBest = lbSnap.exists() ? (lbSnap.data().bestScore as number) ?? 0 : 0;

    await setDoc(
        lbRef,
        {
            uid,
            displayName,
            totalScore: currentTotal + score,           // Acumulado — base del ranking
            bestScore: Math.max(currentLbBest, score),  // Mejor individual — referencia
            gamesPlayed: increment(1),
            updatedAt: serverTimestamp(),
        },
        { merge: true }
    );
}

/**
 * Obtiene el top N de la clasificación global.
 */
export async function getLeaderboard(topN = 10): Promise<LeaderboardEntry[]> {
    const q = query(
        collection(db, 'leaderboard'),
        orderBy('totalScore', 'desc'),  // Ordenar por puntuación acumulada total
        limit(topN)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as LeaderboardEntry);
}
