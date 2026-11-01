import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

import { AppHeader } from '../../components/AppHeader';
import { Button } from '../../components/Button';
import { FadeSlideIn } from '../../components/FadeSlideIn';
import { colors, radius, spacing, withAlpha } from '../../theme/theme';
import { fontFamily, fontSize } from '../../theme/typography';
import type { RootStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type ResultRoute = RouteProp<RootStackParamList, 'QuizResult'>;

function messageFor(ratio: number, perfect: boolean): string {
  if (perfect) return 'Sempurna! Semua jawaban benar.';
  if (ratio >= 0.7) return 'Bagus! Sedikit lagi menuju sempurna.';
  return 'Terus berlatih, kamu pasti bisa.';
}

export function QuizResultScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<ResultRoute>();
  const { score, total, kanaType, mode, wrong } = route.params;

  const ratio = total === 0 ? 0 : score / total;
  const perfect = total > 0 && score === total;
  const pct = Math.round(ratio * 100);

  return (
    <View style={styles.screen}>
      <AppHeader title="Hasil Kuis" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.centerColumn}>
          <FadeSlideIn style={styles.fullWidth}>
            <LinearGradient
              colors={['#59785F', '#43604A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.hero, { borderRadius: radius.xl }]}
            >
              <Text style={styles.heroPct}>{pct}%</Text>
              <Text style={styles.heroScore}>
                {score} / {total} benar
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
                      key={`${item.character}-${index}`}
                      style={[styles.wrongRow, index > 0 && styles.wrongDivider]}
                    >
                      <View style={styles.wrongBadge}>
                        <Text style={styles.wrongChar}>{item.character}</Text>
                      </View>
                      <Text style={styles.wrongRomaji}>{item.romaji}</Text>
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
                    Tak ada jawaban salah. Kerja bagus!
                  </Text>
                </View>
              </FadeSlideIn>
            </>
          )}

          <View style={styles.spacer24} />

          <FadeSlideIn delay={220} style={styles.fullWidth}>
            <Button
              label="Ulangi kuis"
              icon="refresh"
              variant="primary"
              onPress={() =>
                navigation.replace('Quiz', {
                  totalQuestions: total,
                  kanaType,
                  mode,
                })
              }
            />
          </FadeSlideIn>

          <View style={styles.spacer12} />

          <FadeSlideIn delay={280} style={styles.fullWidth}>
            <Button
              label="Selesai"
              icon="checkmark"
              variant="outline"
              onPress={() => navigation.goBack()}
            />
          </FadeSlideIn>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
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
    color: withAlpha('#FFFFFF', 0.9),
  },
  heroMsg: {
    marginTop: 12,
    fontSize: fontSize.body,
    fontFamily: fontFamily.regular,
    color: withAlpha('#FFFFFF', 0.85),
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
  },
  wrongDivider: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  wrongBadge: {
    width: 44,
    height: 44,
    borderRadius: radius.chip,
    backgroundColor: withAlpha(colors.error, 0.1),
    alignItems: 'center',
    justifyContent: 'center',
  },
  wrongChar: {
    fontSize: 22,
    fontFamily: fontFamily.kana,
    color: colors.textPrimary,
  },
  wrongRomaji: {
    marginLeft: 14,
    fontSize: fontSize.body,
    fontFamily: fontFamily.medium,
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
  spacer12: { height: 12 },
  spacer24: { height: 24 },
});
