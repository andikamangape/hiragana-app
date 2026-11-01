import { kanaSource } from './kanaSource';
import { statsStore } from './statsStore';
import { letterKey } from './types';
import type { Kana, KanaType, LetterStat } from './types';

export interface KanaProgress {
  kana: Kana;
  right: number;
  wrong: number;
  attempts: number;
  accuracy: number | null;
}

export interface RowProgress {
  row: string;
  total: number;
  attempted: number;
  right: number;
  wrong: number;
  accuracy: number | null;
}

export interface ProgressData {
  type: KanaType;
  totalKana: number;
  attemptedKana: number;
  right: number;
  wrong: number;
  accuracy: number | null;
  rows: RowProgress[];
  weakest: KanaProgress[];
  strongest: KanaProgress[];
}

function ratio(right: number, attempts: number): number | null {
  return attempts === 0 ? null : right / attempts;
}

function buildKanaProgress(
  kanaList: Kana[],
  type: KanaType,
  stats: Record<string, LetterStat>,
): KanaProgress[] {
  return kanaList.map((kana) => {
    const stat = stats[letterKey(type, kana.romaji)];
    const right = stat?.right ?? 0;
    const wrong = stat?.wrong ?? 0;
    const attempts = right + wrong;
    return {
      kana,
      right,
      wrong,
      attempts,
      accuracy: ratio(right, attempts),
    };
  });
}

function buildRowProgress(items: KanaProgress[]): RowProgress[] {
  const byRow: Record<string, KanaProgress[]> = {};
  for (const item of items) {
    const row = item.kana.row;
    if (!byRow[row]) byRow[row] = [];
    byRow[row].push(item);
  }
  return Object.entries(byRow).map(([row, list]) => {
    let right = 0;
    let wrong = 0;
    let attempted = 0;
    for (const item of list) {
      right += item.right;
      wrong += item.wrong;
      if (item.attempts > 0) attempted++;
    }
    return {
      row,
      total: list.length,
      attempted,
      right,
      wrong,
      accuracy: ratio(right, right + wrong),
    };
  });
}

export async function loadProgress(type: KanaType): Promise<ProgressData> {
  const stats = await statsStore.getLetterStats();
  const kanaList = kanaSource.getKana(type);
  const items = buildKanaProgress(kanaList, type, stats);
  const rows = buildRowProgress(items);

  let right = 0;
  let wrong = 0;
  let attemptedKana = 0;
  for (const item of items) {
    right += item.right;
    wrong += item.wrong;
    if (item.attempts > 0) attemptedKana++;
  }

  const attemptedItems = items.filter((item) => item.attempts > 0);
  const weakest = [...attemptedItems]
    .sort((a, b) => {
      const wa = (a.accuracy ?? 1) - (b.accuracy ?? 1);
      if (wa !== 0) return wa;
      return b.wrong - a.wrong;
    })
    .slice(0, 5);

  const strongest = [...attemptedItems]
    .sort((a, b) => {
      const wa = (b.accuracy ?? 0) - (a.accuracy ?? 0);
      if (wa !== 0) return wa;
      return b.right - a.right;
    })
    .slice(0, 5);

  return {
    type,
    totalKana: items.length,
    attemptedKana,
    right,
    wrong,
    accuracy: ratio(right, right + wrong),
    rows,
    weakest,
    strongest,
  };
}
