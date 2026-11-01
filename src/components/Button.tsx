import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, radius, shadow, spacing, withAlpha } from '../theme/theme';
import { fontFamily } from '../theme/typography';

type Variant = 'primary' | 'accent' | 'outline' | 'ghost';
type IconName = keyof typeof Ionicons.glyphMap;

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  icon?: IconName;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  disabled = false,
  style,
}: ButtonProps) {
  if (variant === 'primary' || variant === 'accent') {
    const stops = variant === 'accent' ? colors.accent : colors.primary;
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={[styles.pressable, shadow.card, style, disabled && styles.disabled]}
      >
        <LinearGradient
          colors={[withAlpha(stops, 1), withAlpha(stops, 0.85)]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {icon && <Ionicons name={icon} size={18} color={colors.onPrimary} />}
          <Text style={styles.primaryLabel}>{label}</Text>
        </LinearGradient>
      </Pressable>
    );
  }

  const outline = variant === 'outline';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.plain,
        outline ? styles.outline : styles.ghost,
        style,
        disabled && styles.disabled,
      ]}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={18}
          color={outline ? colors.primary : colors.textSecondary}
        />
      )}
      <Text style={outline ? styles.outlineLabel : styles.ghostLabel}>
        {label}
      </Text>
    </Pressable>
  );
}

const HEIGHT = 52;

const styles = StyleSheet.create({
  pressable: {
    borderRadius: radius.input,
  },
  gradient: {
    height: HEIGHT,
    borderRadius: radius.input,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: spacing.screen,
  },
  primaryLabel: {
    color: colors.onPrimary,
    fontSize: 15,
    fontFamily: fontFamily.semibold,
  },
  plain: {
    height: HEIGHT,
    borderRadius: radius.input,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: spacing.screen,
  },
  outline: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: withAlpha(colors.primary, 0.08),
  },
  ghost: {
    backgroundColor: withAlpha(colors.textSecondary, 0.06),
  },
  outlineLabel: {
    color: colors.primary,
    fontSize: 15,
    fontFamily: fontFamily.semibold,
  },
  ghostLabel: {
    color: colors.textSecondary,
    fontSize: 15,
    fontFamily: fontFamily.medium,
  },
  disabled: {
    opacity: 0.45,
  },
});
