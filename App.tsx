import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

import { colors } from './src/theme/theme';
import { HomeScreen } from './src/features/home/HomeScreen';
import { KanaListScreen } from './src/features/kana/KanaListScreen';
import { ProgressScreen } from './src/features/progress/ProgressScreen';
import { QuizSetupScreen } from './src/features/kana/QuizSetupScreen';
import { QuizScreen } from './src/features/kana/QuizScreen';
import { QuizResultScreen } from './src/features/kana/QuizResultScreen';
import { StoryListScreen } from './src/features/story/StoryListScreen';
import { StoryScreen } from './src/features/story/StoryScreen';
import { StoryResultScreen } from './src/features/story/StoryResultScreen';
import type { RootStackParamList } from './src/navigation/types';

SplashScreen.preventAutoHideAsync().catch(() => {});

const Stack = createNativeStackNavigator<RootStackParamList>();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.surface,
    text: colors.textPrimary,
    border: colors.border,
    primary: colors.primary,
  },
};

export default function App() {
  const [loaded, error] = useFonts({
    'PlusJakartaSans-Regular': require('./assets/fonts/PlusJakartaSans-Regular.ttf'),
    'PlusJakartaSans-Medium': require('./assets/fonts/PlusJakartaSans-Medium.ttf'),
    'PlusJakartaSans-SemiBold': require('./assets/fonts/PlusJakartaSans-SemiBold.ttf'),
    'PlusJakartaSans-Bold': require('./assets/fonts/PlusJakartaSans-Bold.ttf'),
    NotoSansJP: require('./assets/fonts/NotoSansJP.ttf'),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={navTheme}>
        <StatusBar style="dark" />
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="KanaList" component={KanaListScreen} />
          <Stack.Screen name="Progress" component={ProgressScreen} />
          <Stack.Screen name="QuizSetup" component={QuizSetupScreen} />
          <Stack.Screen name="Quiz" component={QuizScreen} />
          <Stack.Screen name="QuizResult" component={QuizResultScreen} />
          <Stack.Screen name="StoryList" component={StoryListScreen} />
          <Stack.Screen name="Story" component={StoryScreen} />
          <Stack.Screen name="StoryResult" component={StoryResultScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
