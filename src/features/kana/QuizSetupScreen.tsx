import React, { useMemo, useState } from 'react';
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

import { AppHeader } from '../../components/AppHeader';
import { Button } from '../../components/Button';
import { FadeSlideIn } from '../../components/FadeSlideIn';
import { SegmentedToggle } from '../../components/SegmentedToggle';
import { colors, radius, shadow, spacing, withAlpha } from '../../theme/theme';
import { fontFamily, fontSize } from '../../theme/typography';
import { kanaSource } from '../../data/kanaSource';
import type { KanaType } from '../../data/types';
import type { RootStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const PRESETS = [5, 10, 15, 20];

export function QuizSetupScreen() {
  const navigation = useNavigation<Nav>();
  const [type, setType] = useState<KanaType>('hiragana');
  const [count, setCount] = useState('10');
  const [error, setError] = useState<string | null>(null);

  const kanaList = useMemo(() => kanaSource.getKana(type), [type]);
  const maxKana = kanaList.length;
  const rows = useMemo(() => {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const k of kanaList) {
      if (!seen.has(k.row)) {
        seen.add(k.row);
        result.push(k.row);
      }
    }
    return result;
  }, [kanaList]);

  const startQuiz = () => {
    const value = parseInt(count.trim(), 10);
    if (Number.isNaN(value) || value < 1) {
      setError('Masukkan angka minimal 1');
      return;
    }
    if (value > maxKana) {
      setError(`Maksimal ${maxKana} soal untuk tipe ini`);
      return;
    }
    setError(null);
    navigation.navigate('Quiz', { totalQuestions: value, kanaType: type });
  };

  const startRowQuiz = (row: string) => {
    navigation.navigate('Quiz', { totalQuestions: 5, kanaType: type, row });
  };

  const startWeakDrill = () => {
    navigation.navigate('Quiz', {
      totalQuestions: 10,
      kanaType: type,
      mode: 'srs',
    });
  };

  return (
    <View style={styles.screen}>
      <AppHeader title="Atur Kuis" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.centerColumn}>
          <FadeSlideIn style={styles.fullWidth}>
            <SegmentedToggle
              value={type}
              onChange={setType}
              options={[
                { value: 'hiragana', label: 'Hiragana' },
                { value: 'katakana', label: 'Katakana' },
              ]}
            />
          </FadeSlideIn>

          <View style={styles.spacer24} />

          <FadeSlideIn delay={80} style={styles.fullWidth}>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Jumlah soal</Text>
              <View style={styles.spacer4} />
              <Text style={styles.sectionSubtitle}>
                Maksimal {maxKana} soal tersedia
              </Text>
              <View style={styles.spacer12} />
              <TextInput
                value={count}
                onChangeText={setCount}
                keyboardType="number-pad"
                maxLength={2}
                style={styles.input}
                placeholder={`1 - ${maxKana}`}
                placeholderTextColor={colors.textSecondary}
                onSubmitEditing={startQuiz}
              />
              <View style={styles.spacer12} />
              <View style={styles.presetRow}>
                {PRESETS.map((n) => {
                  const disabled = n > maxKana;
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
              onPress={startQuiz}
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
                  onPress={() => startRowQuiz(row)}
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
                onPress={startWeakDrill}
              />
            </View>
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
    paddingVertical: 24,
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
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    ...shadow.card,
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
  weakCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: withAlpha(colors.accent, 0.3),
    padding: 20,
    ...shadow.card,
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
