import type { Story } from './types';

import storiesData from '../../assets/data/stories.json';

const stories = storiesData as Story[];

export const storySource = {
  getStories(): Story[] {
    return stories;
  },
  getStory(id: string): Story | null {
    return stories.find((s) => s.id === id) ?? null;
  },
};
