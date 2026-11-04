import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { minTapTarget, spacing, type Palette } from '../theme/theme';
import { useThemedStyles } from '../theme/useThemedStyles';
import { useTheme } from '../theme/ThemeProvider';
import { fontFamily, fontSize } from '../theme/typography';

interface AppHeaderProps {
  title: string;
  right?: React.ReactNode;
  onBack?: () => void;
  showThemeToggle?: boolean;
}

export function AppHeader({
  title,
  right,
  onBack,
  showThemeToggle = true,
}: AppHeaderProps) {
  const insets = useSafeAreaInsets();
  const { colors, isDark, toggle } = useTheme();
  const styles = useThemedStyles(makeStyles);

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.sm }]}>
      <View style={[styles.side, styles.sideStart]}>
        {onBack && (
          <Pressable
            style={styles.iconButton}
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="Kembali"
          >
            <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
          </Pressable>
        )}
      </View>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.side}>
        {right}
        {showThemeToggle && (
          <Pressable
            style={styles.iconButton}
            onPress={toggle}
            accessibilityRole="button"
            accessibilityLabel={isDark ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'}
          >
            <Ionicons
              name={isDark ? 'sunny-outline' : 'moon-outline'}
              size={20}
              color={colors.textPrimary}
            />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingBottom: spacing.md,
      paddingHorizontal: spacing.sm,
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    title: {
      flex: 1,
      textAlign: 'center',
      fontSize: fontSize.title,
      fontFamily: fontFamily.semibold,
      color: colors.textPrimary,
    },
    side: {
      minWidth: 88,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: spacing.xs,
    },
    sideStart: {
      justifyContent: 'flex-start',
    },
    iconButton: {
      width: minTapTarget,
      height: minTapTarget,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
