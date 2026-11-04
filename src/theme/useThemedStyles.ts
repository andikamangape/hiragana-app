import { useMemo } from 'react';

import { useTheme } from './ThemeProvider';
import type { Palette } from './theme';

export function useThemedStyles<T>(factory: (colors: Palette) => T): T {
  const { colors } = useTheme();
  return useMemo(() => factory(colors), [factory, colors]);
}
