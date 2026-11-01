import AsyncStorage from '@react-native-async-storage/async-storage';

import type { KanaType, LetterStat, QuizResult } from './types';
import { letterKey } from './types';

const KEY_HISTORY = 'quiz_history';
const KEY_LETTER_STATS = 'quiz_letter_stats';
const MAX_HISTORY = 20;

export const statsStore = {
  async getHistory(): Promise<QuizResult[]> {
    const raw = await AsyncStorage.getItem(KEY_HISTORY);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw) as QuizResult[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  async getLetterStats(): Promise<Record<string, LetterStat>> {
    const raw = await AsyncStorage.getItem(KEY_LETTER_STATS);
    if (!raw) return {};
    try {
      return JSON.parse(raw) as Record<string, LetterStat>;
    } catch {
      return {};
    }
  },

  async recordQuizResult(result: QuizResult): Promise<void> {
    const history = await this.getHistory();
    const next = [result, ...history].slice(0, MAX_HISTORY);
    await AsyncStorage.setItem(KEY_HISTORY, JSON.stringify(next));
  },

  async recordLetterAnswers(
    answers: Record<string, boolean>,
    type: KanaType,
  ): Promise<void> {
    const stats = await this.getLetterStats();
    const updated: Record<string, LetterStat> = { ...stats };
    for (const [romaji, isCorrect] of Object.entries(answers)) {
      const key = letterKey(type, romaji);
      const current = updated[key] ?? { right: 0, wrong: 0 };
      updated[key] = isCorrect
        ? { right: current.right + 1, wrong: current.wrong }
        : { right: current.right, wrong: current.wrong + 1 };
    }
    await AsyncStorage.setItem(KEY_LETTER_STATS, JSON.stringify(updated));
  },
};

export interface QuizStatsSummary {
  lastResult: QuizResult | null;
  totalQuizzes: number;
  lettersAnswered: number;
  worstLetter: string | null;
}

export async function loadStatsSummary(): Promise<QuizStatsSummary> {
  const history = await statsStore.getHistory();
  const letterStats = await statsStore.getLetterStats();

  let lastResult: QuizResult | null = null;
  for (const result of history) {
    if (lastResult === null || result.date > lastResult.date) {
      lastResult = result;
    }
  }

  let lettersAnswered = 0;
  let worstLetter: string | null = null;
  let worstWrong = 0;
  for (const [key, value] of Object.entries(letterStats)) {
    if (value.right + value.wrong > 0) lettersAnswered++;
    if (value.wrong > worstWrong) {
      worstWrong = value.wrong;
      worstLetter = key.split(':')[1] ?? null;
    }
  }

  return {
    lastResult,
    totalQuizzes: history.length,
    lettersAnswered,
    worstLetter,
  };
}
