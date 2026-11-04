import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppHeader } from '../../components/AppHeader';
import { Button } from '../../components/Button';
import { FadeSlideIn } from '../../components/FadeSlideIn';
import { onGradient, radius, spacing, type Palette } from '../../theme/theme';
import { useThemedStyles } from '../../theme/useThemedStyles';
import { useTheme } from '../../theme/ThemeProvider';
import { fontFamily, fontSize } from '../../theme/typography';
import { storySource } from '../../data/storySource';
import type { RootStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type ResultRoute = RouteProp<RootStackParamList, 'StoryResult'>;

function messageFor(ratio: number, perfect: boolean): string {
  if (perfect) return 'Sempurna! Cerita ini sudah kamu kuasai.';
  if (ratio >= 0.7) return 'Bagus! Sedikit lagi menuju sempurna.';
  return 'Baca ulang ceritanya, lalu coba lagi.';
}

export function StoryResultScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<ResultRoute>();
  const insets = useSafeAreaInsets();
  const { colors, gradients } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { storyId, correct, total, wrong } = route.params;

  const story = storySource.getStory(storyId);
  const ratio = total === 0 ? 0 : correct / total;
  const perfect = total > 0 && correct === total;
  const pct = Math.round(ratio * 100);

  return (
    <View style={styles.screen}>
      <AppHeader title="Hasil Cerita" />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: spacing.screen + insets.bottom },
        ]}
      >
        <View style={styles.centerColumn}>
          <FadeSlideIn style={styles.fullWidth}>
            <LinearGradient
              colors={[...gradients.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.hero, { borderRadius: radius.xl }]}
            >
              <Text style={styles.heroPct}>{pct}%</Text>
              <Text style={styles.heroScore}>
                {correct} / {total} benar
              </Text>
              <Text style={styles.heroMsg}>{messageFor(ratio, perfect)}</Text>
            </LinearGradient>
          </FadeSlideIn>

          {wrong.length > 0 && (
            <>
              <View style={styles.spacer24} />
              <FadeSlideIn delay={120} style={styles.fullWidth}>
                <Text style={styles.sectionTitle}>
                  Perlu diulang ({wrong.length})
                </Text>
                <View style={styles.spacer12} />
                <View style={styles.card}>
                  {wrong.map((item, index) => (
                    <View
                      key={`${item.prompt}-${index}`}
                      style={[styles.wrongRow, index > 0 && styles.wrongDivider]}
                    >
                      <Ionicons
                        name="close-circle"
                        size={20}
                        color={colors.error}
                      />
                      <View style={styles.wrongText}>
                        <Text style={styles.wrongPrompt}>{item.prompt}</Text>
                        <Text style={styles.wrongAnswer}>
                          Jawaban: {item.answerId}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </FadeSlideIn>
            </>
          )}

          {wrong.length === 0 && (
            <>
              <View style={styles.spacer24} />
              <FadeSlideIn delay={120} style={styles.fullWidth}>
                <View style={styles.perfectCard}>
                  <Ionicons name="sparkles" size={32} color={colors.accent} />
                  <Text style={styles.perfectText}>
                    Semua jawaban benar. Kerja bagus!
                  </Text>
                </View>
              </FadeSlideIn>
            </>
          )}

          <View style={styles.spacer24} />

          <FadeSlideIn delay={220} style={styles.fullWidth}>
            <Button
              label="Baca Ulang"
              icon="refresh"
              variant="primary"
              onPress={() => navigation.replace('Story', { storyId })}
            />
          </FadeSlideIn>

          <View style={styles.spacer12} />

          <FadeSlideIn delay={280} style={styles.fullWidth}>
            <Button
              label="Daftar Cerita"
              icon="book"
              variant="outline"
              onPress={() => navigation.navigate('StoryList')}
            />
          </FadeSlideIn>

          {story && (
            <>
              <View style={styles.spacer12} />
              <Text style={styles.hint}>
                Selesai: {story.titleId}
              </Text>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.screen,
    alignItems: 'center',
  },
  centerColumn: {
    width: '100%',
    maxWidth: 480,
  },
  fullWidth: {
    width: '100%',
  },
  hero: {
    padding: 28,
    alignItems: 'center',
  },
  heroPct: {
    fontSize: 52,
    fontFamily: fontFamily.bold,
    color: colors.onPrimary,
  },
  heroScore: {
    marginTop: 4,
    fontSize: fontSize.body,
    fontFamily: fontFamily.medium,
    color: onGradient.muted,
  },
  heroMsg: {
    marginTop: 12,
    fontSize: fontSize.body,
    fontFamily: fontFamily.regular,
    color: onGradient.muted,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: fontSize.label,
    fontFamily: fontFamily.semibold,
    letterSpacing: 0.4,
    color: colors.textSecondary,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
  },
  wrongRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  wrongDivider: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  wrongText: {
    flex: 1,
  },
  wrongPrompt: {
    fontSize: fontSize.body,
    fontFamily: fontFamily.medium,
    color: colors.textPrimary,
  },
  wrongAnswer: {
    marginTop: 2,
    fontSize: fontSize.label,
    fontFamily: fontFamily.regular,
    color: colors.error,
  },
  perfectCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    alignItems: 'center',
  },
  perfectText: {
    marginTop: 10,
    fontSize: fontSize.body,
    fontFamily: fontFamily.medium,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  hint: {
    textAlign: 'center',
    fontSize: fontSize.caption,
    fontFamily: fontFamily.regular,
    color: colors.textSecondary,
  },
  spacer12: { height: 12 },
  spacer24: { height: 24 },
  });
