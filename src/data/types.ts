export type KanaType = 'hiragana' | 'katakana';

export interface Kana {
  character: string;
  romaji: string;
  type: KanaType;
  strokeCount: number;
  audioPath: string | null;
  row: string;
}

export interface QuizResult {
  score: number;
  total: number;
  type: KanaType;
  date: string;
}

export interface LetterStat {
  right: number;
  wrong: number;
}

export function srsWeight(stat: LetterStat | undefined): number {
  const right = stat?.right ?? 0;
  const wrong = stat?.wrong ?? 0;
  let w: number;
  if (right === 0 && wrong === 0) {
    w = 3.0;
  } else {
    w = 1.5 + (wrong * 3.0 - right * 2.0);
  }
  return w < 0.5 ? 0.5 : w;
}

export const letterKey = (type: KanaType, romaji: string): string =>
  `${type}:${romaji}`;

export interface StorySentence {
  kana: string;
  romaji: string;
  id: string;
}

export interface StoryQuestion {
  prompt: string;
  answerKana: string[];
  answerId: string;
  bank: string[];
}

export interface Story {
  id: string;
  title: string;
  titleId: string;
  level: number;
  sentences: StorySentence[];
  questions: StoryQuestion[];
}

export interface StoryResult {
  storyId: string;
  correct: number;
  total: number;
  date: string;
}
