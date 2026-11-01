import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '../theme/theme';
import { fontFamily, fontSize } from '../theme/typography';

interface AppHeaderProps {
  title: string;
  right?: React.ReactNode;
  onBack?: () => void;
}

export function AppHeader({ title, right, onBack }: AppHeaderProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <View style={styles.side}>
        {onBack && (
          <Pressable style={styles.backButton} onPress={onBack} hitSlop={8}>
            <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
          </Pressable>
        )}
      </View>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.side}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 12,
    paddingHorizontal: 8,
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
    width: 64,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  backButton: {
    padding: 4,
  },
});
