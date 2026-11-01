import AsyncStorage from '@react-native-async-storage/async-storage';

import type { StoryResult } from './types';

const KEY_STORY_HISTORY = 'story_history';
const MAX_HISTORY = 50;

export interface StoryStat {
  bestCorrect: number;
  total: number;
  attempts: number;
  completed: boolean;
}

export const storyStore = {
  async getHistory(): Promise<StoryResult[]> {
    const raw = await AsyncStorage.getItem(KEY_STORY_HISTORY);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw) as StoryResult[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  async recordStoryResult(result: StoryResult): Promise<void> {
    const history = await this.getHistory();
    const next = [result, ...history].slice(0, MAX_HISTORY);
    await AsyncStorage.setItem(KEY_STORY_HISTORY, JSON.stringify(next));
  },
};

export async function getStoryStats(): Promise<Record<string, StoryStat>> {
  const history = await storyStore.getHistory();
  const stats: Record<string, StoryStat> = {};
  for (const result of history) {
    const current = stats[result.storyId] ?? {
      bestCorrect: 0,
      total: result.total,
      attempts: 0,
      completed: false,
    };
    current.attempts += 1;
    current.total = result.total;
    if (result.correct > current.bestCorrect) {
      current.bestCorrect = result.correct;
    }
    if (result.total > 0 && result.correct === result.total) {
      current.completed = true;
    }
    stats[result.storyId] = current;
  }
  return stats;
}
