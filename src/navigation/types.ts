import type { KanaType } from '../data/types';

export interface QuizWrongItem {
  character: string;
  romaji: string;
}

export interface StoryWrongItem {
  prompt: string;
  answerId: string;
}

export type RootStackParamList = {
  Home: undefined;
  KanaList: undefined;
  Progress: undefined;
  QuizSetup: undefined;
  Quiz: {
    totalQuestions: number;
    kanaType: KanaType;
    row?: string;
    rows?: string[];
    mode?: 'srs';
  };
  QuizResult: {
    score: number;
    total: number;
    kanaType: KanaType;
    mode?: 'srs';
    rows?: string[];
    wrong: QuizWrongItem[];
  };
  StoryList: undefined;
  Story: {
    storyId: string;
  };
  StoryResult: {
    storyId: string;
    correct: number;
    total: number;
    wrong: StoryWrongItem[];
  };
};
