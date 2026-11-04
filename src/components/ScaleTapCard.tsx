import React, { useCallback, useState } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { radius, elevation, type Palette } from '../theme/theme';
import { useThemedStyles } from '../theme/useThemedStyles';

interface ScaleTapCardProps {
  children: React.ReactNode;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

export function ScaleTapCard({
  children,
  onPress,
  style,
  contentStyle,
  accessibilityLabel,
}: ScaleTapCardProps) {
  const styles = useThemedStyles(makeStyles);
  const [scale] = useState(() => new Animated.Value(1));
  const animateTo = useCallback(
    (value: number) => {
      Animated.timing(scale, {
        toValue: value,
        duration: 130,
        useNativeDriver: true,
      }).start();
    },
    [scale],
  );
  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <Pressable
        onPressIn={() => animateTo(0.96)}
        onPressOut={() => animateTo(1)}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={[styles.card, elevation.card]}
      >
        <View style={contentStyle}>{children}</View>
      </Pressable>
    </Animated.View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: radius.card,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
  });
