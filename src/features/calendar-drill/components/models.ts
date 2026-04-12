import type { DateParts } from "../domain/doomsday";

export type WeekdayChoice = {
  value: string;
  label: string;
  shortcutKey: string;
};

export type PracticeQuestion = {
  date: DateParts;
  choices: WeekdayChoice[];
  correctValue: string;
  prompt: string;
};

export type PracticeStats = {
  attempts: number;
  correct: number;
  streak: number;
  bestStreak: number;
  totalResponseMs: number;
};

export type PracticeTrends = {
  accuracyDelta: number | null;
  avgResponseDeltaMs: number | null;
};

export type AnswerState = {
  selectedValue: string;
  isCorrect: boolean;
  responseMs: number;
};

export type SessionStatus = "idle" | "running";