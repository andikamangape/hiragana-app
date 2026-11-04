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
import { SegmentedToggle } from '../../components/SegmentedToggle';
import { elevation, onGradient, radius, spacing, withAlpha, type Palette } from '../../theme/theme';
import { useThemedStyles } from '../../theme/useThemedStyles';
import { useTheme } from '../../theme/ThemeProvider';
import { fontFamily, fontSize } from '../../theme/typography';
import { loadProgress, type ProgressData } from '../../data/progress';
import type { KanaType } from '../../data/types';
import type { RootStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

type ProgressState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; data: ProgressData };

export function ProgressScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [type, setType] = useState<KanaType>('hiragana');
  const [state, setState] = useState<ProgressState>({ status: 'loading' });

  const goToQuiz = useCallback(
    (targetType: KanaType) =>
      navigation.navigate('Quiz', {
        totalQuestions: 10,
        kanaType: targetType,
        mode: 'srs',
      }),
    [navigation],
  );

  const refresh = useCallback((nextType: KanaType) => {
    let active = true;
    Promise.resolve()
      .then(() => {
        if (active) setState({ status: 'loading' });
      })
      .then(() => loadProgress(nextType))
      .then((data) => {
        if (active) setState({ status: 'ready', data });
      })
      .catch(() => {
        if (active) setState({ status: 'error' });
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    return refresh(type);
  }, [refresh, type]);

  useFocusEffect(
    useCallback(() => {
      return refresh(type);
    }, [refresh, type]),
  );

  return (
    <View style={styles.screen}>
      <AppHeader title="Kemajuan" onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: spacing.screen + insets.bottom },
        ]}
      >
        <View style={styles.centerColumn}>
          <SegmentedToggle
            value={type}
            onChange={setType}
            options={[
              { value: 'hiragana', label: 'Hiragana' },
              { value: 'katakana', label: 'Katakana' },
            ]}
          />

          <View style={styles.spacer24} />

          {state.status === 'loading' && (
            <View style={styles.stateCard}>
              <ActivityIndicator color={colors.primary} />
            </View>
          )}

          {state.status === 'error' && (
            <View style={styles.stateCard}>
              <Ionicons name="alert-circle" size={20} color={colors.error} />
              <View style={styles.spacer12} />
              <Text style={styles.stateText}>
                Gagal memuat kemajuan. Coba buka lagi nanti.
              </Text>
            </View>
          )}

          {state.status === 'ready' && (
            <ProgressBody
              data={state.data}
              onStartWeakDrill={() => goToQuiz(type)}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function ProgressBody({
  data,
  onStartWeakDrill,
}: {
  data: ProgressData;
  onStartWeakDrill: () => void;
}) {
  const { colors, gradients } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const accuracyPct =
    data.accuracy === null ? '-' : `${Math.round(data.accuracy * 100)}%`;
  const hasWeak = data.weakest.length > 0;

  return (
    <>
      <FadeSlideIn style={styles.fullWidth}>
        <LinearGradient
          colors={[...gradients.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.summaryCard, { borderRadius: radius.xl }]}
        >
          <Text style={styles.summaryAccuracy}>{accuracyPct}</Text>
          <Text style={styles.summaryLabel}>akurasi keseluruhan</Text>
          <View style={styles.spacer16} />
          <View style={styles.summaryRow}>
            <SummaryStat
              label="Benar"
              value={`${data.right}`}
              color={onGradient.right}
            />
            <SummaryStat
              label="Salah"
              value={`${data.wrong}`}
              color={onGradient.wrong}
            />
            <SummaryStat
              label="Huruf dilatih"
              value={`${data.attemptedKana}/${data.totalKana}`}
              color={colors.onPrimary}
            />
          </View>
        </LinearGradient>
      </FadeSlideIn>

      <View style={styles.spacer24} />

      <FadeSlideIn delay={100} style={styles.fullWidth}>
        <Text style={styles.sectionTitle}>Per baris</Text>
        <View style={styles.spacer12} />
        <View style={styles.card}>
          {data.rows.map((row, index) => (
            <View
              key={row.row}
              style={[styles.rowBlock, index > 0 && styles.rowBlockDivider]}
            >
              <View style={styles.rowHeader}>
                <Text style={styles.rowTitle}>Baris {row.row}</Text>
                <Text style={styles.rowMeta}>
                  {row.attempted}/{row.total} dilatih
                </Text>
              </View>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    { width: `${Math.round((row.accuracy ?? 0) * 100)}%` },
                  ]}
                />
              </View>
              <Text style={styles.rowAccuracy}>
                {row.accuracy === null
                  ? 'Belum dilatih'
                  : `${Math.round(row.accuracy * 100)}% benar (${row.right}/${row.right + row.wrong})`}
              </Text>
            </View>
          ))}
        </View>
      </FadeSlideIn>

      {hasWeak && (
        <>
          <View style={styles.spacer24} />
          <FadeSlideIn delay={200} style={styles.fullWidth}>
            <Text style={styles.sectionTitle}>Perlu diperkuat</Text>
            <View style={styles.spacer12} />
            <View style={styles.card}>
              {data.weakest.map((item, index) => (
                <KanaStatRow
                  key={item.kana.character}
                  index={index}
                  item={item}
                  tone="weak"
                />
              ))}
            </View>
          </FadeSlideIn>
        </>
      )}

      <View style={styles.spacer24} />

      <FadeSlideIn delay={280} style={styles.fullWidth}>
        <Button
          label="Latihan Huruf Lemah"
          icon="flame"
          variant={hasWeak ? 'accent' : 'ghost'}
          disabled={!hasWeak}
          onPress={onStartWeakDrill}
        />
      </FadeSlideIn>

      {!hasWeak && (
        <FadeSlideIn delay={320} style={styles.fullWidth}>
          <Text style={styles.hintText}>
            Kerjakan kuis dulu untuk mengisi data huruf lemah.
          </Text>
        </FadeSlideIn>
      )}
    </>
  );
}

function SummaryStat({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.summaryStat}>
      <Text style={[styles.summaryStatValue, { color }]}>{value}</Text>
      <Text style={styles.summaryStatLabel}>{label}</Text>
    </View>
  );
}

function KanaStatRow({
  item,
  index,
  tone,
}: {
  item: {
    kana: { character: string; romaji: string };
    right: number;
    wrong: number;
    accuracy: number | null;
  };
  index: number;
  tone: 'weak' | 'strong';
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const pct = item.accuracy === null ? '-' : `${Math.round(item.accuracy * 100)}%`;
  return (
    <View style={[styles.kanaStatRow, index > 0 && styles.kanaStatRowDivider]}>
      <View
        style={[
          styles.kanaBadge,
          {
            backgroundColor: withAlpha(
              tone === 'weak' ? colors.error : colors.success,
              0.12,
            ),
          },
        ]}
      >
        <Text style={styles.kanaBadgeChar}>{item.kana.character}</Text>
      </View>
      <View style={styles.kanaInfo}>
        <Text style={styles.kanaRomaji}>{item.kana.romaji}</Text>
        <Text style={styles.kanaDetail}>
          {item.right} benar · {item.wrong} salah
        </Text>
      </View>
      <Text
        style={[
          styles.kanaAccuracy,
          { color: tone === 'weak' ? colors.error : colors.success },
        ]}
      >
        {pct}
      </Text>
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
  stateCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 24,
    alignItems: 'center',
  },
  stateText: {
    fontSize: fontSize.body,
    fontFamily: fontFamily.regular,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  summaryCard: {
    padding: 24,
    alignItems: 'center',
  },
  summaryAccuracy: {
    fontSize: 48,
    fontFamily: fontFamily.bold,
    color: colors.onPrimary,
  },
  summaryLabel: {
    marginTop: 2,
    fontSize: fontSize.label,
    fontFamily: fontFamily.regular,
    color: onGradient.muted,
  },
  summaryRow: {
    flexDirection: 'row',
    width: '100%',
  },
  summaryStat: {
    flex: 1,
    alignItems: 'center',
  },
  summaryStatValue: {
    fontSize: fontSize.h2,
    fontFamily: fontFamily.bold,
  },
  summaryStatLabel: {
    marginTop: 2,
    fontSize: fontSize.caption,
    fontFamily: fontFamily.regular,
    color: onGradient.subtle,
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
    ...elevation.card,
  },
  rowBlock: {
    paddingVertical: 14,
  },
  rowBlockDivider: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  rowTitle: {
    fontSize: fontSize.body,
    fontFamily: fontFamily.semibold,
    color: colors.textPrimary,
  },
  rowMeta: {
    fontSize: fontSize.caption,
    fontFamily: fontFamily.regular,
    color: colors.textSecondary,
  },
  barTrack: {
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.surfaceMuted,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  rowAccuracy: {
    marginTop: 6,
    fontSize: fontSize.caption,
    fontFamily: fontFamily.regular,
    color: colors.textSecondary,
  },
  kanaStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  kanaStatRowDivider: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  kanaBadge: {
    width: 44,
    height: 44,
    borderRadius: radius.chip,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kanaBadgeChar: {
    fontSize: 22,
    fontFamily: fontFamily.kana,
    color: colors.textPrimary,
  },
  kanaInfo: {
    flex: 1,
    marginLeft: 12,
  },
  kanaRomaji: {
    fontSize: fontSize.body,
    fontFamily: fontFamily.semibold,
    color: colors.textPrimary,
  },
  kanaDetail: {
    marginTop: 1,
    fontSize: fontSize.caption,
    fontFamily: fontFamily.regular,
    color: colors.textSecondary,
  },
  kanaAccuracy: {
    fontSize: fontSize.title,
    fontFamily: fontFamily.bold,
  },
  hintText: {
    marginTop: 10,
    fontSize: fontSize.caption,
    fontFamily: fontFamily.regular,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  spacer12: { height: 12 },
  spacer16: { height: 16 },
  spacer24: { height: 24 },
  });
