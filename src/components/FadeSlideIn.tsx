import React, { useEffect, useState } from 'react';
import { Animated, Easing, type ViewStyle, type StyleProp } from 'react-native';

interface FadeSlideInProps {
  children: React.ReactNode;
  duration?: number;
  delay?: number;
  style?: StyleProp<ViewStyle>;
}

export function FadeSlideIn({
  children,
  duration = 220,
  delay = 0,
  style,
}: FadeSlideInProps) {
  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    progress.setValue(0);
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: duration + delay,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [progress, duration, delay]);

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [16, 0],
  });

  return (
    <Animated.View
      style={[{ opacity: progress, transform: [{ translateY }] }, style]}
    >
      {children}
    </Animated.View>
  );
}
