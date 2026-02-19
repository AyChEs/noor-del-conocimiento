'use client';

import { incorrectAnswerFeedback } from '@/ai/flows/incorrect-answer-feedback';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { useTranslation } from '@/context/LanguageProvider';
import { useAuth } from '@/context/AuthProvider';
import questionsData from '@/data/questions.json';
import {
  calculateQuestionScore,
  calculateFinalScore,
  getTimerDuration,
  shuffleArray,
  DIFFICULTY_WEIGHT,
  CATEGORY_MULTIPLIER,
} from '@/lib/gameLogic';
import {
  getQuestionWeights,
  weightedSample,
  recordQuestionAnswer,
  saveGameResult,
} from '@/lib/firestore';
import type { Difficulty, GameMode, Question, Player } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  BookOpen,
  Bot,
  BrainCircuit,
  Clock,
  Heart,
  HelpCircle,
  LogOut,
  SkipForward,
  Star,
  User,
  Users,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react';

const MAX_ROUNDS_MAJLIS = 15;
const QUESTIONS_PER_SOLO_GAME = 15;

function PlayPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, language } = useTranslation();
  const { user } = useAuth();

  // Game settings
  const gameMode = searchParams.get('mode') as 'musafir' | 'majlis' | null;
  const category = (searchParams.get('category') as GameMode) || 'mix';
  const difficulty = (searchParams.get('difficulty') as Difficulty) || 'easy';

  // Game State
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Musafir State
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [maxPossiblePoints, setMaxPossiblePoints] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [lives, setLives] = useState(3);

  // Majlis State
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [round, setRound] = useState(1);
  const [turnState, setTurnState] = useState<'playing' | 'transition'>('playing');

  // UI State
  const [timer, setTimer] = useState(30);
  const [isAnswered, setIsAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [disabledOptions, setDisabledOptions] = useState<string[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);
  const [lifelines, setLifelines] = useState({ fiftyFifty: 2, extraTime: 2, skip: 1 });
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [showScoringInfo, setShowScoringInfo] = useState(false);

  // Refs para cleanup
  const pendingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (pendingTimeoutRef.current) clearTimeout(pendingTimeoutRef.current);
    };
  }, []);

  // Helper seguro para setTimeout con cleanup automático
  const safeTimeout = useCallback((fn: () => void, delay: number) => {
    if (pendingTimeoutRef.current) clearTimeout(pendingTimeoutRef.current);
    pendingTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) fn();
    }, delay);
  }, []);

  // Derived State
  const currentQuestion = questions[currentQuestionIndex];
  const questionTimerDuration = currentQuestion ? getTimerDuration(currentQuestion.difficulty) : 30;
  const isMajlis = gameMode === 'majlis';
  const currentPlayer = isMajlis ? players[currentPlayerIndex] : null;

  // Puntuación final sobre 100 (solo modo Musafir)
  const displayScore = calculateFinalScore(earnedPoints, maxPossiblePoints);

  // Initialization — usa SRS si el usuario está autenticado
  useEffect(() => {
    if (!gameMode) {
      router.push('/');
      return;
    }

    let questionPool: Question[];
    if (category === 'mix') {
      questionPool = questionsData.filter(q => q.difficulty === difficulty) as Question[];
    } else {
      questionPool = questionsData.filter(
        q => q.category === category && q.difficulty === difficulty
      ) as Question[];
    }

    if (gameMode === 'musafir') {
      const initQuestions = async () => {
        let gameQuestions: Question[];

        // Optimización: Si hay usuario, intentamos usar SRS, pero con límites
        if (user) {
          try {
            // 1. Seleccionar un pool de candidatos aleatorios (ej. 60) para no leer 600 docs
            // Esto evita saturar la red/CPU en móviles con cientos de lecturas simultáneas
            const candidates = shuffleArray(questionPool).slice(0, 60);
            const candidateIds = candidates.map(q => q.id);

            // 2. Obtener pesos solo para estos candidatos
            const weights = await getQuestionWeights(user.uid, candidateIds);

            // 3. Muestreo ponderado sobre los candidatos
            gameQuestions = weightedSample(candidates, weights, QUESTIONS_PER_SOLO_GAME);

            // 4. Relleno de seguridad si SRS devolvió pocas (raro con 60 candidatos)
            if (gameQuestions.length < QUESTIONS_PER_SOLO_GAME) {
              const used = new Set(gameQuestions.map(q => q.id));
              const remaining = candidates.filter(q => !used.has(q.id));
              gameQuestions = [...gameQuestions, ...remaining].slice(0, QUESTIONS_PER_SOLO_GAME);
            }
          } catch (error) {
            console.error('Error cargando SRS, usando modo aleatorio:', error);
            // Fallback: aleatorio simple si falla Firestore
            gameQuestions = shuffleArray(questionPool).slice(0, QUESTIONS_PER_SOLO_GAME);
          }
        } else {
          // Sin sesión → aleatorio normal
          gameQuestions = shuffleArray(questionPool).slice(0, QUESTIONS_PER_SOLO_GAME);
        }

        setQuestions(gameQuestions);
        setLives(3);
        // Calcular puntos máximos basado en las preguntas seleccionadas
        const maxPts = gameQuestions.length > 0
          ? gameQuestions.reduce((sum, q) => sum + DIFFICULTY_WEIGHT[q.difficulty as Difficulty], 0)
          : 0;

        setMaxPossiblePoints(maxPts);
      };

      initQuestions();
    } else if (gameMode === 'majlis') {
      const playersParam = searchParams.get('players');
      if (playersParam) {
        try {
          const decodedPlayers = JSON.parse(decodeURIComponent(playersParam));
          setPlayers(decodedPlayers);
          const questionsNeeded = decodedPlayers.length * MAX_ROUNDS_MAJLIS;
          setQuestions(shuffleArray(questionPool).slice(0, questionsNeeded));
          setTurnState('transition');
        } catch {
          router.push('/');
        }
      } else {
        router.push('/');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameMode, category, difficulty, user]);

  const goToNextQuestion = useCallback(() => {
    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex(prev => prev + 1);
      setIsAnswered(false);
      setSelectedAnswer(null);
      setDisabledOptions([]);
      setShowFeedback(false);
    } else {
      // Fin del juego — guardar resultado si hay sesión
      const finalScore = calculateFinalScore(earnedPoints, maxPossiblePoints);
      if (user) {
        saveGameResult(user.uid, user.displayName ?? 'Usuario', finalScore).catch(console.error);
      }
      router.push(`/game-over?score=${finalScore}&correct=${correctCount}&total=${questions.length}`);
    }
  }, [currentQuestionIndex, questions.length, router, earnedPoints, maxPossiblePoints, correctCount, user]);

  const handleNextTurn = useCallback((currentPlayers: Player[]) => {
    // Recibe el estado actualizado de players para evitar race condition
    const activePlayers = currentPlayers.filter(p => !p.isEliminated).length;
    if (activePlayers <= 1 || round >= MAX_ROUNDS_MAJLIS) {
      sessionStorage.setItem('majlis_players', JSON.stringify(currentPlayers));
      router.push('/majlis-game-over');
      return;
    }

    let nextPlayerIndex = (currentPlayerIndex + 1) % currentPlayers.length;
    while (currentPlayers[nextPlayerIndex].isEliminated) {
      nextPlayerIndex = (nextPlayerIndex + 1) % currentPlayers.length;
    }

    const isNewRound = nextPlayerIndex < currentPlayerIndex;
    if (isNewRound) setRound(r => r + 1);

    setCurrentPlayerIndex(nextPlayerIndex);

    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex(prev => prev + 1);
      setIsAnswered(false);
      setSelectedAnswer(null);
      setDisabledOptions([]);
      setShowFeedback(false);
      setTurnState('transition');
    } else {
      sessionStorage.setItem('majlis_players', JSON.stringify(currentPlayers));
      router.push('/majlis-game-over');
    }
  }, [currentPlayerIndex, round, router, currentQuestionIndex, questions.length]);

  const handleContinueAfterFeedback = useCallback(() => {
    setShowFeedback(false);
    if (isMajlis) {
      setPlayers(prev => {
        const activePlayers = prev.filter(p => !p.isEliminated).length;
        if (activePlayers <= 1) {
          sessionStorage.setItem('majlis_players', JSON.stringify(prev));
          router.push('/majlis-game-over');
        } else {
          handleNextTurn(prev);
        }
        return prev;
      });
    } else {
      if (lives <= 0) {
        const finalScore = calculateFinalScore(earnedPoints, maxPossiblePoints);
        router.push(`/game-over?score=${finalScore}&correct=${correctCount}&total=${questions.length}`);
      } else {
        goToNextQuestion();
      }
    }
  }, [isMajlis, lives, earnedPoints, maxPossiblePoints, correctCount, questions.length, handleNextTurn, goToNextQuestion, router]);

  // Timer Effect
  useEffect(() => {
    if (isAnswered || turnState === 'transition') return;

    if (timer <= 0) {
      setIsAnswered(true);
      setSelectedAnswer('timeout');

      if (isMajlis && currentPlayer) {
        setPlayers(prev => {
          const updated = prev.map(p => {
            if (p.id === currentPlayer.id) {
              const newLives = p.lives - 1;
              return { ...p, lives: newLives, isEliminated: newLives <= 0 };
            }
            return p;
          });
          safeTimeout(() => handleNextTurn(updated), 1000);
          return updated;
        });
      } else {
        const newLives = lives - 1;
        if (newLives <= 0) {
          setLives(0);
          const finalScore = calculateFinalScore(earnedPoints, maxPossiblePoints);
          safeTimeout(() => router.push(`/game-over?score=${finalScore}&correct=${correctCount}&total=${questions.length}`), 1000);
        } else {
          setLives(newLives);
          safeTimeout(goToNextQuestion, 1000);
        }
      }
      return;
    }

    const interval = setInterval(() => {
      setTimer(prev => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer, isAnswered, turnState, isMajlis, currentPlayer, lives, earnedPoints, maxPossiblePoints, correctCount, questions.length, router, goToNextQuestion, safeTimeout, handleNextTurn]);

  // Resetear timer cuando cambia la pregunta (usando el índice, no el objeto)
  useEffect(() => {
    if (questions[currentQuestionIndex]) {
      setTimer(getTimerDuration(questions[currentQuestionIndex].difficulty));
    }
  }, [currentQuestionIndex, questions]);

  const handleAnswer = async (answer: string) => {
    if (isAnswered) return;

    setIsAnswered(true);
    setSelectedAnswer(answer);

    const isCorrect = answer.trim() === currentQuestion.correctAnswer[language].trim();

    // Registrar en historial SRS si hay sesión activa (modo Musafir)
    if (user && !isMajlis) {
      recordQuestionAnswer(user.uid, currentQuestion.id, isCorrect).catch(console.error);
    }

    if (isCorrect) {
      const questionScore = calculateQuestionScore(
        currentQuestion.difficulty,
        timer,
        questionTimerDuration,
        currentQuestion.category  // Multiplicador por categoría
      );

      if (isMajlis && currentPlayer) {
        setPlayers(prev => {
          const updated = prev.map(p =>
            p.id === currentPlayer.id ? { ...p, score: p.score + Math.round(questionScore * 10) } : p
          );
          safeTimeout(() => handleNextTurn(updated), 1000);
          return updated;
        });
      } else {
        setEarnedPoints(prev => prev + questionScore);
        setCorrectCount(prev => prev + 1);
        safeTimeout(goToNextQuestion, 1000);
      }
    } else {
      // Respuesta incorrecta
      if (isMajlis && currentPlayer) {
        setPlayers(prev => {
          const updated = prev.map(p => {
            if (p.id === currentPlayer.id) {
              const newLives = p.lives - 1;
              return { ...p, lives: newLives, isEliminated: newLives <= 0 };
            }
            return p;
          });
          return updated;
        });
      } else {
        setLives(prev => prev - 1);
      }

      setIsFeedbackLoading(true);
      setShowFeedback(true);
      try {
        const feedbackResult = await incorrectAnswerFeedback({
          question: currentQuestion.question[language],
          correctAnswer: currentQuestion.correctAnswer[language],
          userAnswer: answer,
          language: language,
        });
        if (isMountedRef.current) setFeedbackText(feedbackResult.explanation);
      } catch (error) {
        console.error('Failed to get AI feedback:', error);
        if (isMountedRef.current) setFeedbackText(t('feedback.error'));
      } finally {
        if (isMountedRef.current) setIsFeedbackLoading(false);
      }
    }
  };

  // Renombrado de useLifeline → handleLifeline (no es un hook)
  const handleLifeline = (type: 'fiftyFifty' | 'extraTime' | 'skip') => {
    if (isAnswered) return;

    if (isMajlis && currentPlayer) {
      if (currentPlayer.lifelines[type] <= 0) return;
      if (type === 'skip' && difficulty === 'easy') return;

      setPlayers(prev =>
        prev.map((p): Player =>
          p.id === (currentPlayer as Player).id
            ? { ...p, lifelines: { ...p.lifelines, [type]: p.lifelines[type] - 1 } }
            : p
        )
      );
    } else {
      if (lifelines[type] <= 0) return;
      if (type === 'skip' && difficulty === 'easy') return;
      setLifelines(prev => ({ ...prev, [type]: prev[type] - 1 }));
    }

    if (type === 'fiftyFifty') {
      const incorrectOptions = currentQuestion.options[language].filter(
        opt => opt.trim() !== currentQuestion.correctAnswer[language].trim()
      );
      const toDisable = shuffleArray(incorrectOptions).slice(0, 2);
      setDisabledOptions(toDisable);
    } else if (type === 'extraTime') {
      setTimer(prev => prev + 15);
    } else if (type === 'skip') {
      if (isMajlis) {
        setPlayers(prev => {
          handleNextTurn(prev);
          return prev;
        });
      } else {
        goToNextQuestion();
      }
    }
  };

  const getButtonClass = (option: string) => {
    if (!isAnswered) return 'bg-background/80 text-foreground hover:bg-primary/10';
    if (option.trim() === currentQuestion.correctAnswer[language].trim())
      return 'bg-accent text-accent-foreground animate-correct-pulse';
    if (option === selectedAnswer) return 'bg-destructive text-destructive-foreground animate-gentle-shake';
    return 'bg-card/50 text-foreground/50';
  };

  if (!gameMode || !currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>{t('loading.game')}</p>
      </div>
    );
  }

  if (isMajlis && turnState === 'transition') {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4">
        <Card className="p-8 text-center animate-in fade-in-50">
          <p className="text-muted-foreground">{t('play.round')} {round}/{MAX_ROUNDS_MAJLIS}</p>
          <h2 className="text-4xl font-bold font-headline mt-2">{t('play.turnOf')}</h2>
          <p className="text-6xl font-bold text-primary mt-4">{currentPlayer?.name}</p>
          <Button onClick={() => setTurnState('playing')} className="mt-8 h-12 text-lg">
            {t('play.readyButton')}
          </Button>
        </Card>
      </main>
    );
  }

  const displayLives = isMajlis ? currentPlayer?.lives : lives;
  const displayLifelines = isMajlis ? currentPlayer?.lifelines : lifelines;

  const categoryTranslations: { [key: string]: string } = {
    Seerah: t('category.seerah'),
    Profetas: t('category.prophets'),
    'Corán y General': t('category.general'),
    mix: t('category.mix'),
  };

  // — Visual theme per category —
  const CATEGORY_THEME: Record<string, { emoji: string; color: string; border: string; bg: string }> = {
    'Seerah': { emoji: '🕌', color: 'text-emerald-500', border: 'border-emerald-500/30', bg: 'from-emerald-500/5' },
    'Profetas': { emoji: '⭐', color: 'text-amber-500', border: 'border-amber-500/30', bg: 'from-amber-500/5' },
    'Corán y General': { emoji: '📖', color: 'text-blue-500', border: 'border-blue-500/30', bg: 'from-blue-500/5' },
  };
  const catTheme = CATEGORY_THEME[currentQuestion?.category] ?? { emoji: '✨', color: 'text-primary', border: 'border-primary/20', bg: 'from-primary/5' };

  // Barra de tiempo: verde → amarillo → rojo
  const timerPct = (timer / questionTimerDuration) * 100;
  const timerColor = timerPct > 50 ? 'bg-emerald-500' : timerPct > 25 ? 'bg-yellow-400' : 'bg-red-500';

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-3 sm:p-6">
      <div className="w-full max-w-4xl">
        <Card className={`shadow-2xl border-2 ${catTheme.border} overflow-hidden`}>
          {/* Banda de color por categoría */}
          <div className={`h-1 w-full bg-gradient-to-r ${timerColor} transition-all duration-1000`}
            style={{ width: `${timerPct}%`, height: '4px' }} />

          <CardHeader className="p-3 sm:p-4 bg-gradient-to-b from-card to-card/90">
            <div className="flex justify-between items-center">
              {/* Vidas + botón salir */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Heart key={i} className={cn(
                      'w-5 h-5 transition-all',
                      i < (displayLives ?? 0) ? 'text-red-500 fill-red-500' : 'text-muted-foreground/30'
                    )} />
                  ))}
                </div>
                <button
                  onClick={() => setShowExitDialog(true)}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors text-xs"
                  aria-label={t('play.exitAria')}
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('play.exit')}</span>
                </button>
              </div>

              {/* Puntuación central */}
              {isMajlis ? (
                <div className="text-center">
                  <p className="font-bold text-primary text-lg leading-none">{currentPlayer?.name}</p>
                  <p className="font-semibold text-base">{currentPlayer?.score} {t('playerStatus.pts')}</p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-xs text-muted-foreground uppercase tracking-widest">{t('play.score')}</p>
                  <p className="font-bold text-2xl leading-none">
                    {displayScore}<span className="text-sm text-muted-foreground font-normal">/100</span>
                  </p>
                </div>
              )}

              {/* Comodines */}
              <div className="flex items-center gap-1 sm:gap-2">
                {[
                  { type: 'fiftyFifty' as const, icon: <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />, label: '50/50' },
                  { type: 'extraTime' as const, icon: <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />, label: '+15s' },
                  { type: 'skip' as const, icon: <SkipForward className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />, label: 'Skip', hidden: difficulty === 'easy' },
                ].map(({ type, icon, label, hidden }) => (
                  <button
                    key={type}
                    onClick={() => handleLifeline(type)}
                    disabled={!displayLifelines || displayLifelines[type] <= 0 || isAnswered || hidden}
                    className="flex flex-col items-center gap-0.5 p-1 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed enabled:hover:bg-primary/10 enabled:active:scale-95"
                    aria-label={label}
                  >
                    <div className="relative">
                      <div className="p-1.5 bg-primary/15 rounded-full">{icon}</div>
                      <Badge variant="secondary" className="absolute -top-2 -right-2 h-4 w-4 p-0 justify-center text-primary font-bold text-xs">
                        {displayLifelines?.[type]}
                      </Badge>
                    </div>
                    <span className="text-[10px] font-semibold hidden sm:inline">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Timer bar */}
            <div className="mt-3 h-2 bg-muted/30 rounded-full overflow-hidden relative">
              <div
                className={cn('h-full rounded-full transition-all duration-1000', timerColor)}
                style={{ width: `${timerPct}%` }}
              />
              <span className={cn(
                'absolute right-0 top-1/2 -translate-y-1/2 text-[10px] font-bold px-1 rounded',
                timerPct <= 25 ? 'text-red-500' : 'text-muted-foreground'
              )}>
                {timer}s
              </span>
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-8 text-center">
            {/* Badge de categoría clickable */}
            <div className="flex justify-center mb-4">
              <button
                onClick={() => setShowScoringInfo(true)}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-transform hover:scale-105 active:scale-95',
                  catTheme.color, catTheme.border,
                  `bg-gradient-to-r ${catTheme.bg} to-transparent`
                )}
                title="Ver sistema de puntuación"
              >
                <span>{catTheme.emoji}</span>
                {categoryTranslations[currentQuestion.category] || currentQuestion.category}
                {/* Multiplicador visible */}
                {CATEGORY_MULTIPLIER[currentQuestion.category] && CATEGORY_MULTIPLIER[currentQuestion.category] > 1.0 && (
                  <span className="opacity-70">×{CATEGORY_MULTIPLIER[currentQuestion.category].toFixed(1)}</span>
                )}
                <HelpCircle className="w-3 h-3 ms-1 opacity-50" />
              </button>
            </div>

            <div className="mb-6 min-h-[100px]">
              <p className="text-xl sm:text-2xl md:text-3xl font-headline font-semibold leading-snug">
                {currentQuestion.question[language]}
              </p>
              {currentQuestion.arabicVerse && (
                <p className="font-arabic text-2xl mt-4 text-primary/80" dir="rtl">
                  {currentQuestion.arabicVerse}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentQuestion.options[language].map(option => (
                <Button
                  key={option}
                  variant="outline"
                  onClick={() => handleAnswer(option)}
                  disabled={isAnswered || disabledOptions.includes(option)}
                  className={cn(
                    'h-auto min-h-14 p-4 text-base sm:text-lg whitespace-normal break-words transition-all duration-300 rounded-2xl',
                    getButtonClass(option)
                  )}
                >
                  {option}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Diálogo de confirmación para salir */}
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <LogOut className="h-5 w-5 text-destructive" />
              {t('play.exitTitle')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('play.exitDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('play.exitCancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => router.push('/')}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('play.exitConfirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showFeedback} onOpenChange={setShowFeedback}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bot className="text-primary w-6 h-6" />
              {t('feedback.title')}
            </DialogTitle>
            <DialogDescription asChild>
              <div className="text-left pt-4">
                <p className="font-bold">{t('feedback.incorrect')}</p>
                <p className="mt-2">
                  {t('feedback.correctAnswerIs')}{' '}
                  <strong className="text-accent">{currentQuestion.correctAnswer[language]}</strong>
                </p>
                <div className="mt-4 p-4 bg-primary/10 rounded-lg">
                  <div className="flex items-start gap-2">
                    <BrainCircuit className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                    <span>{isFeedbackLoading ? t('feedback.generating') : feedbackText}</span>
                  </div>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
          <Button onClick={handleContinueAfterFeedback} className="mt-4">
            {t('feedback.continue')}
          </Button>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Información de Puntuación */}
      <Dialog open={showScoringInfo} onOpenChange={setShowScoringInfo}>
        <DialogContent className="max-w-sm sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-primary">
              <Star className="w-5 h-5" />
              {t('rules.scoring.title')}
            </DialogTitle>
            <DialogDescription>
              {t('rules.rulesScrollPrompt')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
              <h4 className="font-bold text-sm mb-2">{t('rules.scoring.title')}</h4>
              <ul className="text-xs space-y-2 text-muted-foreground list-disc ps-4">
                <li>{t('rules.scoring.difficulty')}</li>
                <li>{t('rules.scoring.category')}</li>
                <li>{t('rules.scoring.timeBonus')}</li>
                <li>{t('rules.scoring.accumulation')}</li>
              </ul>
            </div>
            <div className="text-xs text-muted-foreground italic bg-muted/30 p-3 rounded-lg">
              Tip: ¡Responde rápido y elige categorías difíciles para maximizar tus puntos!
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowScoringInfo(false)} className="w-full">
              {t('feedback.continue')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}

export default function PlayPageWrapper() {
  const { t } = useTranslation();
  return (
    <Suspense fallback={<div>{t('loading.default')}</div>}>
      <PlayPage />
    </Suspense>
  );
}
