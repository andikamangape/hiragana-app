import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { elevation, radius, minTapTarget, type Palette } from '../theme/theme';
import { useThemedStyles } from '../theme/useThemedStyles';
import { fontFamily } from '../theme/typography';

interface SegmentedToggleProps<T extends string> {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}

export function SegmentedToggle<T extends string>({
  value,
  options,
  onChange,
}: SegmentedToggleProps<T>) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.container}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="button"
            accessibilityLabel={option.label}
            accessibilityState={{ selected: active }}
            style={[styles.segment, active && styles.segmentActive]}
          >
            <Text style={[styles.label, active && styles.labelActive]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      backgroundColor: colors.surfaceMuted,
      borderRadius: radius.input,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 3,
    },
    segment: {
      flex: 1,
      minHeight: minTapTarget - 6,
      justifyContent: 'center',
      paddingVertical: 10,
      alignItems: 'center',
      borderRadius: radius.input - 3,
    },
    segmentActive: {
      backgroundColor: colors.primary,
      ...elevation.card,
    },
    label: {
      fontSize: 14,
      fontFamily: fontFamily.semibold,
      color: colors.textSecondary,
    },
    labelActive: {
      color: colors.onPrimary,
    },
  });
