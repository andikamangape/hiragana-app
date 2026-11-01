import type { Kana, KanaType } from './types';

import hiraganaData from '../../assets/data/hiragana.json';
import katakanaData from '../../assets/data/katakana.json';

const byType: Record<KanaType, Kana[]> = {
  hiragana: hiraganaData as Kana[],
  katakana: katakanaData as Kana[],
};

export const kanaSource = {
  getKana(type: KanaType): Kana[] {
    return byType[type];
  },
};
