import type { LevelKey } from "@/constants/theme";

export type Levels = LevelKey;

export interface Word {
  wordId: string;
  jp: string;
  kana: string;
  ko: string;
}

export interface FillInBlankOption {
  id: number;
  text: string;
  ko: string;
}

export interface FillInBlankQuiz {
  quizId: string;
  sentence: string;
  translation: string;
  options: FillInBlankOption[];
  answerId: number;
  explanation: string;
  hint: string;
}

export type WrongAnswerMode = "word" | "blank";

export interface WrongAnswerItem {
  id: string;
  mode: WrongAnswerMode;
  level: LevelKey;
  addedAt: number;
  word?: Word;
  wordOptions?: string[];
  quiz?: FillInBlankQuiz;
}
