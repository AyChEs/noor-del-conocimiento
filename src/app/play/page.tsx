'use client';

import { incorrectAnswerFeedback } from '@/ai/flows/incorrect-answer-feedback';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { useTranslation } from '@/context/LanguageProvider';
import questionsData from '@/data/questions.json';
import {
  calculateQuestionScore,
  calculateFinalScore,
  getTimerDuration,
  shuffleArray,
  DIFFICULTY_WEIGHT,
} from '@/lib/gameLogic';
import type { Difficulty, GameMode, Question, Player } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  BookOpen,
  Bot,
  BrainCircuit,
  Clock,
  Heart,
  HelpCircle,
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

  // Game settings
  const gameMode = searchParams.get('mode') as 'musafir' | 'majlis' | null;
  const category = (searchParams.get('category') as GameMode) || 'mix';
  const difficulty = (searchParams.get('difficulty') as Difficulty) || 'easy';

  // Game State
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Musafir State — puntuación acumulada como fracción ponderada
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [maxPossiblePoints, setMaxPossiblePoints] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [lives, setLives] = useState(3);

  // Majlis State
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [round, setRound] = useState(1);
  const [turnState, setTurnState] = useState<'playing' | 'transition'>('playing');

  // Common UI State
  const [timer, setTimer] = useState(30);
  const [isAnswered, setIsAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [disabledOptions, setDisabledOptions] = useState<string[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);
  const [lifelines, setLifelines] = useState({ fiftyFifty: 2, extraTime: 2, skip: 1 });

  // Ref para cleanup de setTimeout — previene memory leaks
  const pendingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Ref para saber si el componente sigue montado
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

  // Initialization
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
      const gameQuestions = shuffleArray(questionPool).slice(0, QUESTIONS_PER_SOLO_GAME);
      setQuestions(gameQuestions);
      setLives(3);
      // Calcular el máximo posible de puntos para esta partida
      const maxPts = gameQuestions.reduce(
        (sum, q) => sum + DIFFICULTY_WEIGHT[q.difficulty as Difficulty],
        0
      );
      setMaxPossiblePoints(maxPts);
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
  }, [gameMode, category, difficulty]);

  const goToNextQuestion = useCallback(() => {
    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex(prev => prev + 1);
      setIsAnswered(false);
      setSelectedAnswer(null);
      setDisabledOptions([]);
      setShowFeedback(false);
    } else {
      // Fin del juego — pasar score final sobre 100
      const finalScore = calculateFinalScore(earnedPoints, maxPossiblePoints);
      router.push(`/game-over?score=${finalScore}&correct=${correctCount}&total=${questions.length}`);
    }
  }, [currentQuestionIndex, questions.length, router, earnedPoints, maxPossiblePoints, correctCount]);

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

    if (isCorrect) {
      const questionScore = calculateQuestionScore(
        currentQuestion.difficulty,
        timer,
        questionTimerDuration
      );

      if (isMajlis && currentPlayer) {
        // En Majlis, el score del jugador es la suma de puntos de pregunta (no sobre 100)
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

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-4xl">
        <Card className="shadow-2xl">
          <CardHeader className="p-4 bg-card-foreground/5">
            <div className="flex justify-between items-center text-foreground/80">
              <div className="flex items-center gap-2">
                <Heart className="w-6 h-6 text-destructive" />
                <span className="text-xl font-bold">{displayLives}</span>
              </div>
              {isMajlis ? (
                <div className="text-center">
                  <p className="font-bold text-primary text-xl">{currentPlayer?.name}</p>
                  <p className="font-semibold text-lg">{currentPlayer?.score} {t('playerStatus.pts')}</p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="font-bold text-primary text-xl">{t('play.score')}</p>
                  <p className="font-semibold text-lg">
                    <span className="text-2xl">{displayScore}</span>
                    <span className="text-sm text-muted-foreground">/100</span>
                  </p>
                </div>
              )}
              <div className="flex items-center gap-2 sm:gap-4">
                <button
                  onClick={() => handleLifeline('fiftyFifty')}
                  disabled={!displayLifelines || displayLifelines.fiftyFifty <= 0 || isAnswered}
                  className="flex flex-col items-center gap-1 p-1 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed enabled:hover:bg-primary/10"
                  aria-label={t('lifeline.fiftyFifty')}
                >
                  <div className="relative">
                    <div className="p-2 bg-primary/20 rounded-full">
                      <HelpCircle className="w-5 h-5 text-primary" />
                    </div>
                    <Badge variant="secondary" className="absolute -top-2 -right-2 h-5 w-5 p-0 justify-center text-primary font-bold">
                      {displayLifelines?.fiftyFifty}
                    </Badge>
                  </div>
                  <span className="text-xs font-semibold hidden sm:inline">50/50</span>
                </button>
                <button
                  onClick={() => handleLifeline('extraTime')}
                  disabled={!displayLifelines || displayLifelines.extraTime <= 0 || isAnswered}
                  className="flex flex-col items-center gap-1 p-1 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed enabled:hover:bg-primary/10"
                  aria-label={t('lifeline.extraTime')}
                >
                  <div className="relative">
                    <div className="p-2 bg-primary/20 rounded-full">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <Badge variant="secondary" className="absolute -top-2 -right-2 h-5 w-5 p-0 justify-center text-primary font-bold">
                      {displayLifelines?.extraTime}
                    </Badge>
                  </div>
                  <span className="text-xs font-semibold hidden sm:inline">+15s</span>
                </button>
                <button
                  onClick={() => handleLifeline('skip')}
                  disabled={!displayLifelines || displayLifelines.skip <= 0 || isAnswered || difficulty === 'easy'}
                  className="flex flex-col items-center gap-1 p-1 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed enabled:hover:bg-primary/10"
                  aria-label={t('lifeline.skip')}
                >
                  <div className="relative">
                    <div className="p-2 bg-primary/20 rounded-full">
                      <SkipForward className="w-5 h-5 text-primary" />
                    </div>
                    <Badge variant="secondary" className="absolute -top-2 -right-2 h-5 w-5 p-0 justify-center text-primary font-bold">
                      {displayLifelines?.skip}
                    </Badge>
                  </div>
                  <span className="text-xs font-semibold hidden sm:inline">{t('lifeline.skip')}</span>
                </button>
              </div>
            </div>
            <Progress value={(timer / questionTimerDuration) * 100} className="w-full h-2 mt-2" />
          </CardHeader>
          <CardContent className="p-8 text-center">
            <div className="mb-8 min-h-[120px]">
              <p className="text-sm text-primary font-medium mb-2 flex items-center justify-center gap-2">
                <BookOpen className="w-4 h-4" />
                {categoryTranslations[currentQuestion.category] || currentQuestion.category}
              </p>
              <p className="text-2xl md:text-3xl font-headline font-semibold">
                {currentQuestion.question[language]}
              </p>
              {currentQuestion.arabicVerse && (
                <p className="font-arabic text-2xl mt-4 text-primary/80" dir="rtl">
                  {currentQuestion.arabicVerse}
                </p>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentQuestion.options[language].map(option => (
                <Button
                  key={option}
                  variant="outline"
                  onClick={() => handleAnswer(option)}
                  disabled={isAnswered || disabledOptions.includes(option)}
                  className={cn(
                    'h-auto min-h-16 p-4 text-lg whitespace-normal break-words transition-all duration-300',
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
