import React, { useCallback, useState } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors, radius, shadow } from '../theme/theme';

interface ScaleTapCardProps {
  children: React.ReactNode;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
}

export function ScaleTapCard({
  children,
  onPress,
  style,
  contentStyle,
}: ScaleTapCardProps) {
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
        style={[styles.card, shadow.card]}
      >
        <View style={contentStyle}>{children}</View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
});
