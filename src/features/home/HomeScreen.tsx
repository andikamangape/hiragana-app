import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppHeader } from '../../components/AppHeader';
import { Button } from '../../components/Button';
import { FadeSlideIn } from '../../components/FadeSlideIn';
import { ScaleTapCard } from '../../components/ScaleTapCard';
import { elevation, radius, spacing, withAlpha, type Palette } from '../../theme/theme';
import { useThemedStyles } from '../../theme/useThemedStyles';
import { useTheme } from '../../theme/ThemeProvider';
import { fontFamily, fontSize } from '../../theme/typography';
import { loadStatsSummary, type QuizStatsSummary } from '../../data/statsStore';
import type { RootStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

type StatsState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; data: QuizStatsSummary };

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { gradients } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [stats, setStats] = useState<StatsState>({ status: 'loading' });

  const refresh = useCallback(() => {
    let active = true;
    loadStatsSummary()
      .then((data) => {
        if (active) setStats({ status: 'ready', data });
      })
      .catch(() => {
        if (active) setStats({ status: 'error' });
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => refresh(), [refresh]);

  useFocusEffect(
    useCallback(() => {
      return refresh();
    }, [refresh]),
  );

  return (
    <View style={styles.screen}>
      <AppHeader title="Hiragana App" />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: spacing.block + insets.bottom },
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
              <Text style={styles.heroKanji}>あ</Text>
              <Text style={styles.heroTitle}>Belajar Bahasa Jepang</Text>
              <Text style={styles.heroSubtitle}>
                Hiragana & Katakana, cara yang menyenangkan
              </Text>
            </LinearGradient>
          </FadeSlideIn>

          <View style={styles.spacer16} />

          <FadeSlideIn delay={120} style={styles.fullWidth}>
            <Button
              label="Mulai Kuis"
              icon="flash"
              variant="primary"
              onPress={() => navigation.navigate('QuizSetup')}
            />
          </FadeSlideIn>

          <View style={styles.spacer24} />

          <FadeSlideIn delay={200} style={styles.fullWidth}>
            <MenuCard
              title="Hiragana & Katakana"
              subtitle="Jelajahi semua huruf + audio"
              icon="list"
              onPress={() => navigation.navigate('KanaList')}
            />
          </FadeSlideIn>

          <View style={styles.spacer12} />

          <FadeSlideIn delay={260} style={styles.fullWidth}>
            <MenuCard
              title="Cerita"
              subtitle="Baca cerita pendek & susun kana"
              icon="book"
              onPress={() => navigation.navigate('StoryList')}
            />
          </FadeSlideIn>

          <View style={styles.spacer12} />

          <FadeSlideIn delay={320} style={styles.fullWidth}>
            <MenuCard
              title="Kemajuan"
              subtitle="Statistik belajar per huruf"
              icon="stats-chart"
              onPress={() => navigation.navigate('Progress')}
            />
          </FadeSlideIn>

          <View style={styles.spacer24} />

          <FadeSlideIn delay={400} style={styles.fullWidth}>
            <StatsCard state={stats} />
          </FadeSlideIn>
        </View>
      </ScrollView>
    </View>
  );
}

function MenuCard({
  title,
  subtitle,
  icon,
  onPress,
}: {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <ScaleTapCard
      onPress={onPress}
      contentStyle={styles.menuContent}
      accessibilityLabel={`${title}. ${subtitle}`}
    >
      <View style={styles.menuRow}>
        <View style={styles.menuIcon}>
          <Ionicons name={icon} size={24} color={colors.primary} />
        </View>
        <View style={styles.menuText}>
          <Text style={styles.menuTitle}>{title}</Text>
          <Text style={styles.menuSubtitle}>{subtitle}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
      </View>
    </ScaleTapCard>
  );
}

function StatsCard({ state }: { state: StatsState }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);

  if (state.status === 'loading') {
    return (
      <View style={styles.statsCard}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (state.status === 'error') {
    return (
      <View style={styles.statsCard}>
        <View style={styles.statRow}>
          <Ionicons name="alert-circle" size={20} color={colors.error} />
          <View style={styles.statLabelGap} />
          <Text style={styles.statLabel}>
            Kemajuan gagal dimuat. Coba buka lagi nanti.
          </Text>
        </View>
      </View>
    );
  }

  const { lastResult, totalQuizzes, lettersAnswered, worstLetter } = state.data;

  return (
    <View style={styles.statsCard}>
      <Text style={styles.statsTitle}>Kemajuan kamu</Text>
      <View style={styles.spacer16} />
      {lastResult === null && totalQuizzes === 0 ? (
        <View style={styles.statRow}>
          <Ionicons name="bar-chart-outline" size={20} color={colors.primary} />
          <View style={styles.statLabelGap} />
          <Text style={styles.statLabel}>
            Belum ada riwayat. Kerjakan satu kuis untuk mulai melacak kemajuanmu.
          </Text>
        </View>
      ) : (
        <>
          <StatRow
            icon="trophy-outline"
            label="Kuis terakhir"
            value={
              lastResult === null
                ? 'Belum ada'
                : `${lastResult.score}/${lastResult.total} (${lastResult.type})`
            }
          />
          <View style={styles.spacer12} />
          <StatRow
            icon="time-outline"
            label="Kuis dikerjakan"
            value={`${totalQuizzes}`}
          />
          <View style={styles.spacer12} />
          <StatRow
            icon="text-outline"
            label="Huruf terjawab"
            value={`${lettersAnswered}`}
          />
          {worstLetter !== null && (
            <>
              <View style={styles.spacer12} />
              <StatRow
                icon="trending-down-outline"
                label="Paling sering salah"
                value={worstLetter}
              />
            </>
          )}
        </>
      )}
    </View>
  );
}

function StatRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.statRow}>
      <Ionicons name={icon} size={20} color={colors.textSecondary} />
      <View style={styles.statLabelGap} />
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
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
    paddingVertical: 36,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  heroKanji: {
    fontSize: 64,
    fontFamily: fontFamily.kana,
    color: colors.onPrimary,
  },
  heroTitle: {
    marginTop: 8,
    fontSize: fontSize.h1,
    fontFamily: fontFamily.bold,
    color: colors.onPrimary,
    textAlign: 'center',
  },
  heroSubtitle: {
    marginTop: 6,
    fontSize: fontSize.body,
    fontFamily: fontFamily.regular,
    color: withAlpha(colors.onPrimary, 0.85),
    textAlign: 'center',
  },
  menuContent: {
    padding: 16,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.chip,
    backgroundColor: withAlpha(colors.primary, 0.12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuText: {
    flex: 1,
    marginLeft: 14,
  },
  menuTitle: {
    fontSize: fontSize.body,
    fontFamily: fontFamily.semibold,
    color: colors.textPrimary,
  },
  menuSubtitle: {
    marginTop: 2,
    fontSize: fontSize.caption + 1,
    fontFamily: fontFamily.regular,
    color: colors.textSecondary,
  },
  statsCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    ...elevation.card,
  },
  statsTitle: {
    fontSize: fontSize.label,
    fontFamily: fontFamily.semibold,
    letterSpacing: 0.4,
    color: colors.textSecondary,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statLabelGap: {
    width: 12,
  },
  statLabel: {
    flex: 1,
    fontSize: fontSize.body,
    fontFamily: fontFamily.regular,
    color: colors.textSecondary,
  },
  statValue: {
    fontSize: fontSize.body,
    fontFamily: fontFamily.semibold,
    color: colors.textPrimary,
  },
  spacer12: { height: 12 },
  spacer16: { height: 16 },
  spacer24: { height: 24 },
  });
