import type { Player } from "./types";

export const RANKS = [
  { minScore: 0, titleKey: 'rank.0.title', descriptionKey: "rank.0.description" },
  { minScore: 40, titleKey: 'rank.1.title', descriptionKey: 'rank.1.description' },
  { minScore: 60, titleKey: 'rank.2.title', descriptionKey: 'rank.2.description' },
  { minScore: 80, titleKey: 'rank.3.title', descriptionKey: 'rank.3.description' },
];

export const getRank = (score: number) => {
  let currentRank = RANKS[0];
  for (const rank of RANKS) {
    if (score >= rank.minScore) {
      currentRank = rank;
    } else {
      break;
    }
  }
  return currentRank;
};

/**
 * Calcula la puntuación de una pregunta como valor entre 0 y 1 (fracción del total).
 * La puntuación final del juego es: round((aciertos_ponderados / total_preguntas) * 100)
 * 
 * Peso por dificultad:
 *   easy   → 1.0 (peso base)
 *   medium → 1.5 (50% más valioso)
 *   hard   → 2.0 (doble de valioso)
 */
export const DIFFICULTY_WEIGHT: Record<'easy' | 'medium' | 'hard', number> = {
  easy: 1.0,
  medium: 1.5,
  hard: 2.0,
};

/**
 * Calcula la puntuación parcial de una pregunta individual.
 * Devuelve un valor entre 0 y el peso de la dificultad.
 * El bonus de tiempo representa hasta el 30% del peso.
 */
export const calculateQuestionScore = (
  difficulty: 'easy' | 'medium' | 'hard',
  timeLeft: number,
  totalTime: number
): number => {
  const weight = DIFFICULTY_WEIGHT[difficulty];
  const timeBonus = weight * 0.3 * (timeLeft / totalTime);
  return weight * 0.7 + timeBonus;
};

/**
 * Calcula la puntuación final sobre 100.
 * @param earnedPoints - suma de calculateQuestionScore de cada acierto
 * @param maxPossiblePoints - suma de DIFFICULTY_WEIGHT de todas las preguntas jugadas
 */
export const calculateFinalScore = (
  earnedPoints: number,
  maxPossiblePoints: number
): number => {
  if (maxPossiblePoints === 0) return 0;
  return Math.round((earnedPoints / maxPossiblePoints) * 100);
};

export const getTimerDuration = (difficulty: 'easy' | 'medium' | 'hard'): number => {
  const durations = {
    easy: 30,
    medium: 20,
    hard: 15,
  };
  return durations[difficulty];
};

/**
 * Fisher-Yates shuffle — distribución uniforme, sin sesgo.
 */
export const shuffleArray = <T>(array: T[]): T[] => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

export const getMajlisRankings = (players: Player[]) => {
  return [...players].sort((a, b) => {
    if (a.isEliminated && !b.isEliminated) return 1;
    if (!a.isEliminated && b.isEliminated) return -1;
    return b.score - a.score;
  });
};
