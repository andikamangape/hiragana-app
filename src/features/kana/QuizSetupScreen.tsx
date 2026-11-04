import React, { useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import PagerView from 'react-native-pager-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppHeader } from '../../components/AppHeader';
import { Button } from '../../components/Button';
import { FadeSlideIn } from '../../components/FadeSlideIn';
import { elevation, radius, spacing, withAlpha, type Palette } from '../../theme/theme';
import { useThemedStyles } from '../../theme/useThemedStyles';
import { useTheme } from '../../theme/ThemeProvider';
import { fontFamily, fontSize } from '../../theme/typography';
import { kanaSource } from '../../data/kanaSource';
import type { Kana, KanaType } from '../../data/types';
import type { RootStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const PRESETS = [5, 10, 15, 20];

const TYPES: KanaType[] = ['hiragana', 'katakana'];
const TYPE_INFO: Record<KanaType, { title: string; sample: string; subtitle: string }> = {
  hiragana: { title: 'Hiragana', sample: 'あ', subtitle: 'Huruf dasar Jepang' },
  katakana: { title: 'Katakana', sample: 'ア', subtitle: 'Untuk kata serapan' },
};

function rowsOf(kanaList: Kana[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const k of kanaList) {
    if (!seen.has(k.row)) {
      seen.add(k.row);
      result.push(k.row);
    }
  }
  return result;
}

export function QuizSetupScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const pagerRef = useRef<PagerView>(null);

  const [page, setPage] = useState(0);
  const [countByType, setCountByType] = useState<Record<KanaType, string>>({
    hiragana: '10',
    katakana: '10',
  });
  const [error, setError] = useState<string | null>(null);
  const [rowsByType, setRowsByType] = useState<Record<KanaType, string[]>>({
    hiragana: [],
    katakana: [],
  });

  const switchPage = (index: number) => {
    setPage(index);
    setError(null);
  };

  const goToPage = (index: number) => {
    pagerRef.current?.setPage(index);
    switchPage(index);
  };

  const toggleRow = (type: KanaType, row: string) => {
    setError(null);
    setRowsByType((prev) => {
      const current = prev[type];
      const next = current.includes(row)
        ? current.filter((r) => r !== row)
        : [...current, row];
      return { ...prev, [type]: next };
    });
  };

  const dataFor = (type: KanaType) => {
    const kanaList = kanaSource.getKana(type);
    const max = kanaList.length;
    const selected = rowsByType[type];
    const selectedKanaCount =
      selected.length === 0
        ? max
        : kanaList.filter((k) => selected.includes(k.row)).length;
    return { rows: rowsOf(kanaList), max, selected, selectedKanaCount };
  };

  const startQuizFor = (type: KanaType) => {
    const { selectedKanaCount } = dataFor(type);
    const value = parseInt(countByType[type].trim(), 10);
    if (Number.isNaN(value) || value < 1) {
      setError('Masukkan angka minimal 1');
      return;
    }
    if (value > selectedKanaCount) {
      setError(`Maksimal ${selectedKanaCount} soal untuk pilihan ini`);
      return;
    }
    setError(null);
    navigation.navigate('Quiz', {
      totalQuestions: value,
      kanaType: type,
      rows: rowsByType[type].length > 0 ? rowsByType[type] : undefined,
    });
  };

  const startRowQuiz = (type: KanaType, row: string) => {
    navigation.navigate('Quiz', { totalQuestions: 5, kanaType: type, row });
  };

  const startWeakDrill = (type: KanaType) => {
    navigation.navigate('Quiz', {
      totalQuestions: 10,
      kanaType: type,
      mode: 'srs',
    });
  };

  const renderPage = (type: KanaType) => {
    const info = TYPE_INFO[type];
    const { rows, max, selected, selectedKanaCount } = dataFor(type);
    const count = countByType[type];
    const setCount = (value: string) =>
      setCountByType((prev) => ({ ...prev, [type]: value }));

    return (
      <View key={type} style={styles.page} collapsable={false}>
        <ScrollView
          contentContainerStyle={[
            styles.pageContent,
            { paddingBottom: spacing.screen + insets.bottom },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.centerColumn}>
            <View style={styles.typeHero}>
              <Text style={styles.typeSample}>{info.sample}</Text>
              <Text style={styles.typeTitle}>{info.title}</Text>
              <Text style={styles.typeSubtitle}>
                {info.subtitle} · {max} kana
              </Text>
            </View>

            <View style={styles.spacer24} />

            <FadeSlideIn delay={80} style={styles.fullWidth}>
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Pilih beberapa baris</Text>
                <View style={styles.spacer4} />
                <Text style={styles.sectionSubtitle}>
                  Centang baris yang mau dikerjakan, lalu mulai
                </Text>
                <View style={styles.spacer12} />
                <View style={styles.rowChips}>
                  {rows.map((row) => {
                    const active = selected.includes(row);
                    return (
                      <Pressable
                        key={row}
                        style={[styles.rowChip, active && styles.rowChipActive]}
                        onPress={() => toggleRow(type, row)}
                      >
                        <Ionicons
                          name={active ? 'checkmark-circle' : 'ellipse-outline'}
                          size={15}
                          color={active ? colors.primary : colors.textSecondary}
                        />
                        <Text
                          style={[
                            styles.rowChipLabel,
                            active && styles.rowChipLabelActive,
                          ]}
                        >
                          Baris {row}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
                <View style={styles.spacer12} />
                <Button
                  label="Mulai Kuis Baris Terpilih"
                  icon="layers"
                  variant="primary"
                  disabled={selected.length === 0}
                  onPress={() => startQuizFor(type)}
                />
              </View>
            </FadeSlideIn>

            <View style={styles.spacer24} />

            <FadeSlideIn delay={160} style={styles.fullWidth}>
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Jumlah soal</Text>
                <View style={styles.spacer4} />
                <Text style={styles.sectionSubtitle}>
                  Maksimal {selectedKanaCount} soal tersedia
                </Text>
                <View style={styles.spacer12} />
                <TextInput
                  value={count}
                  onChangeText={setCount}
                  keyboardType="number-pad"
                  maxLength={2}
                  style={styles.input}
                  placeholder={`1 - ${selectedKanaCount}`}
                  placeholderTextColor={colors.textSecondary}
                  onSubmitEditing={() => startQuizFor(type)}
                />
                <View style={styles.spacer12} />
                <View style={styles.presetRow}>
                  {PRESETS.map((n) => {
                    const disabled = n > selectedKanaCount;
                    const active = count === `${n}`;
                    return (
                      <Pressable
                        key={n}
                        disabled={disabled}
                        onPress={() => setCount(`${n}`)}
                        style={[
                          styles.preset,
                          active && styles.presetActive,
                          disabled && styles.presetDisabled,
                        ]}
                      >
                        <Text
                          style={[
                            styles.presetLabel,
                            active && styles.presetLabelActive,
                            disabled && styles.presetLabelDisabled,
                          ]}
                        >
                          {n}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
                {error && <Text style={styles.errorText}>{error}</Text>}
              </View>
            </FadeSlideIn>

            <View style={styles.spacer24} />

            <FadeSlideIn delay={160} style={styles.fullWidth}>
              <Button
                label="Mulai Kuis"
                icon="play"
                variant="primary"
                onPress={() => startQuizFor(type)}
              />
            </FadeSlideIn>

            <View style={styles.spacer24} />

            <FadeSlideIn delay={240} style={styles.fullWidth}>
              <Text style={styles.groupTitle}>Latihan satu baris</Text>
              <View style={styles.spacer4} />
              <Text style={styles.groupSubtitle}>
                5 soal dari satu baris, urutan acak
              </Text>
              <View style={styles.spacer12} />
              <View style={styles.rowChips}>
                {rows.map((row) => (
                  <Pressable
                    key={row}
                    style={styles.rowChip}
                    onPress={() => startRowQuiz(type, row)}
                  >
                    <Ionicons
                      name="layers"
                      size={15}
                      color={colors.textSecondary}
                    />
                    <Text style={styles.rowChipLabel}>Baris {row}</Text>
                  </Pressable>
                ))}
              </View>
            </FadeSlideIn>

            <View style={styles.spacer24} />

            <FadeSlideIn delay={320} style={styles.fullWidth}>
              <View style={styles.weakCard}>
                <View style={styles.weakHeader}>
                  <Ionicons name="flame" size={22} color={colors.accent} />
                  <View style={styles.weakText}>
                    <Text style={styles.weakTitle}>Fokus huruf lemah</Text>
                    <Text style={styles.weakSubtitle}>
                      Kuis dari huruf yang paling sering kamu salah
                    </Text>
                  </View>
                </View>
                <View style={styles.spacer12} />
                <Button
                  label="Latihan Huruf Lemah"
                  icon="flame"
                  variant="accent"
                  onPress={() => startWeakDrill(type)}
                />
              </View>
            </FadeSlideIn>
          </View>
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={styles.screen}>
      <AppHeader title="Atur Kuis" onBack={() => navigation.goBack()} />

      <View style={styles.topBar}>
        <View style={styles.topBarInner}>
          <Text style={styles.topHint}>Geser untuk ganti tipe</Text>
          <View style={styles.dots}>
            {TYPES.map((type, index) => (
              <Pressable
                key={type}
                hitSlop={8}
                onPress={() => goToPage(index)}
                style={[styles.dot, index === page && styles.dotActive]}
              />
            ))}
          </View>
        </View>
      </View>

      <PagerView
        ref={pagerRef}
        style={styles.pager}
        initialPage={0}
        onPageSelected={(e) => switchPage(e.nativeEvent.position)}
      >
        {TYPES.map(renderPage)}
      </PagerView>
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.screen,
    paddingBottom: 12,
    alignItems: 'center',
  },
  topBarInner: {
    width: '100%',
    maxWidth: 480,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topHint: {
    fontSize: fontSize.label,
    fontFamily: fontFamily.medium,
    color: colors.textSecondary,
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.surfaceMuted,
  },
  dotActive: {
    backgroundColor: colors.primary,
    width: 22,
  },
  pager: {
    flex: 1,
  },
  page: {
    flex: 1,
  },
  pageContent: {
    paddingBottom: 40,
    paddingHorizontal: spacing.screen,
    alignItems: 'center',
  },
  centerColumn: {
    width: '100%',
    maxWidth: 480,
  },
  fullWidth: {
    width: '100%',
  },
  typeHero: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 28,
    marginTop: 12,
    alignItems: 'center',
    ...elevation.card,
  },
  typeSample: {
    fontSize: 72,
    lineHeight: 88,
    fontFamily: fontFamily.kana,
    color: colors.primary,
  },
  typeTitle: {
    fontSize: fontSize.title,
    fontFamily: fontFamily.semibold,
    color: colors.textPrimary,
    marginTop: 4,
  },
  typeSubtitle: {
    fontSize: fontSize.label,
    fontFamily: fontFamily.regular,
    color: colors.textSecondary,
    marginTop: 4,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    ...elevation.card,
  },
  sectionTitle: {
    fontSize: fontSize.title,
    fontFamily: fontFamily.semibold,
    color: colors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: fontSize.label,
    fontFamily: fontFamily.regular,
    color: colors.textSecondary,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.input,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
    fontFamily: fontFamily.semibold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  presetRow: {
    flexDirection: 'row',
    gap: 8,
  },
  preset: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radius.chip,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  presetActive: {
    backgroundColor: withAlpha(colors.primary, 0.12),
    borderColor: colors.primary,
  },
  presetDisabled: {
    opacity: 0.4,
  },
  presetLabel: {
    fontSize: fontSize.body,
    fontFamily: fontFamily.semibold,
    color: colors.textSecondary,
  },
  presetLabelActive: {
    color: colors.primary,
  },
  presetLabelDisabled: {
    color: colors.textSecondary,
  },
  errorText: {
    marginTop: 10,
    fontSize: fontSize.label,
    fontFamily: fontFamily.medium,
    color: colors.error,
  },
  groupTitle: {
    fontSize: fontSize.title,
    fontFamily: fontFamily.semibold,
    color: colors.textPrimary,
  },
  groupSubtitle: {
    fontSize: fontSize.label,
    fontFamily: fontFamily.regular,
    color: colors.textSecondary,
  },
  rowChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  rowChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: radius.chip,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  rowChipLabel: {
    fontSize: fontSize.label,
    fontFamily: fontFamily.medium,
    color: colors.textSecondary,
  },
  rowChipActive: {
    borderColor: colors.primary,
    backgroundColor: withAlpha(colors.primary, 0.1),
  },
  rowChipLabelActive: {
    color: colors.primary,
  },
  weakCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: withAlpha(colors.accent, 0.3),
    padding: 20,
    ...elevation.card,
  },
  weakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weakText: {
    marginLeft: 12,
    flex: 1,
  },
  weakTitle: {
    fontSize: fontSize.body,
    fontFamily: fontFamily.semibold,
    color: colors.textPrimary,
  },
  weakSubtitle: {
    marginTop: 2,
    fontSize: fontSize.label,
    fontFamily: fontFamily.regular,
    color: colors.textSecondary,
  },
  spacer4: { height: 4 },
  spacer12: { height: 12 },
  spacer24: { height: 24 },
  });
