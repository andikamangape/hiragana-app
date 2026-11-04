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

import { radius, spacing, withAlpha, minTapTarget, type Palette } from '../theme/theme';
import { useThemedStyles } from '../theme/useThemedStyles';
import { useTheme } from '../theme/ThemeProvider';
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

const HEIGHT = 52;

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  disabled = false,
  style,
}: ButtonProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);

  if (variant === 'primary' || variant === 'accent') {
    const isAccent = variant === 'accent';
    const base = isAccent ? colors.accent : colors.primary;
    const labelColor = isAccent ? colors.onAccent : colors.onPrimary;
    const stops: [string, string] = [withAlpha(base, 1), withAlpha(base, 0.85)];
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled }}
        style={[styles.pressable, styles.card, style, disabled && styles.disabled]}
      >
        <LinearGradient
          colors={stops}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {icon && <Ionicons name={icon} size={18} color={labelColor} />}
          <Text style={[styles.primaryLabel, { color: labelColor }]}>
            {label}
          </Text>
        </LinearGradient>
      </Pressable>
    );
  }

  const outline = variant === 'outline';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
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

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    pressable: {
      borderRadius: radius.input,
    },
    card: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.06,
      shadowRadius: 16,
      elevation: 2,
    },
    gradient: {
      height: HEIGHT,
      minHeight: minTapTarget,
      borderRadius: radius.input,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      paddingHorizontal: spacing.screen,
    },
    primaryLabel: {
      fontSize: 15,
      fontFamily: fontFamily.semibold,
    },
    plain: {
      height: HEIGHT,
      minHeight: minTapTarget,
      borderRadius: radius.input,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
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
