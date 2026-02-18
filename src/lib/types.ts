export type Difficulty = 'easy' | 'medium' | 'hard';

export type Category = 'Profetas' | 'Seerah' | 'Corán y General';

export type GameMode = Category | 'mix';

export type Language = 'es' | 'en' | 'ma';

export interface MultilingualText {
  es: string;
  en: string;
  ma: string;
}

export interface MultilingualOptions {
  es: string[];
  en: string[];
  ma: string[];
}

export interface Question {
  id: number;
  question: MultilingualText;
  options: MultilingualOptions;
  correctAnswer: MultilingualText;
  category: Category;
  difficulty: Difficulty;
  arabicVerse?: string;
  explanation: MultilingualText;
}

export interface Player {
  id: string;
  name: string;
  score: number;
  lives: number;
  lifelines: {
    fiftyFifty: number;
    extraTime: number;
    skip: number;
  };
  isEliminated: boolean;
}
