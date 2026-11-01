import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';

import { AppHeader } from '../../components/AppHeader';
import { Button } from '../../components/Button';
import { colors, radius, spacing, withAlpha } from '../../theme/theme';
import { fontFamily, fontSize } from '../../theme/typography';
import { kanaSource } from '../../data/kanaSource';
import { srsWeight, type Kana, type LetterStat } from '../../data/types';
import { letterKey } from '../../data/types';
import { statsStore } from '../../data/statsStore';
import { kanaAudio } from '../../utils/kanaAudio';
import type { RootStackParamList, QuizWrongItem } from '../../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type QuizRoute = RouteProp<RootStackParamList, 'Quiz'>;

interface QuizItem {
  kana: Kana;
  options: string[];
}

function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function weightedPick(
  pool: Kana[],
  stats: Record<string, LetterStat>,
  count: number,
): Kana[] {
  const scored = pool.map((kana) => {
    const weight = srsWeight(stats[letterKey(kana.type, kana.romaji)]);
    const key = Math.pow(Math.random(), 1 / weight);
    return { kana, key };
  });
  scored.sort((a, b) => b.key - a.key);
  return scored.slice(0, count).map((e) => e.kana);
}

function buildQuestions(
  kanaPool: Kana[],
  stats: Record<string, LetterStat>,
  total: number,
): QuizItem[] {
  const n = Math.max(1, Math.min(total, kanaPool.length));
  return weightedPick(kanaPool, stats, n).map((answer) => {
    const wrongOptions = shuffle(kanaPool)
      .filter((k) => k.romaji !== answer.romaji)
      .slice(0, 3)
      .map((k) => k.romaji);
    const options = shuffle([...wrongOptions, answer.romaji]);
    return { kana: answer, options };
  });
}

export function QuizScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<QuizRoute>();
  const { totalQuestions, kanaType, row, mode } = route.params;

  const [questions, setQuestions] = useState<QuizItem[] | null>(null);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [empty, setEmpty] = useState(false);
  const letterAnswersRef = React.useRef<Record<string, boolean>>({});
  const wrongRef = React.useRef<QuizWrongItem[]>([]);

  const load = useCallback(async () => {
    const all = kanaSource.getKana(kanaType);
    const stats = await statsStore.getLetterStats();
    let pool = row == null ? all : all.filter((k) => k.row === row);
    if (mode === 'srs') {
      pool = pool.filter(
        (k) => (stats[letterKey(kanaType, k.romaji)]?.wrong ?? 0) > 0,
      );
    }
    return {
      items: buildQuestions(pool, stats, totalQuestions),
      empty: mode === 'srs' && pool.length === 0,
    };
  }, [kanaType, row, totalQuestions, mode]);

  useEffect(() => {
    let active = true;
    load().then((next) => {
      if (active) {
        setQuestions(next.items);
        setEmpty(next.empty);
      }
    });
    return () => {
      active = false;
    };
  }, [load]);

  const selectAnswer = (option: string) => {
    if (answered || !questions) return;
    setAnswered(true);
    setSelected(questions[current].options.indexOf(option));
    const item = questions[current];
    const isCorrect = option === item.kana.romaji;
    if (isCorrect) setScore((s) => s + 1);
    else
      wrongRef.current.push({
        character: item.kana.character,
        romaji: item.kana.romaji,
      });
    letterAnswersRef.current[item.kana.romaji] = isCorrect;
  };

  const persist = useCallback(async () => {
    if (!questions) return;
    await statsStore.recordQuizResult({
      score,
      total: questions.length,
      type: kanaType,
      date: new Date().toISOString(),
    });
    await statsStore.recordLetterAnswers(letterAnswersRef.current, kanaType);
  }, [questions, score, kanaType]);

  const showResult = useCallback(
    async (finalScore: number) => {
      await persist();
      navigation.replace('QuizResult', {
        score: finalScore,
        total: questions?.length ?? 0,
        kanaType,
        mode,
        wrong: wrongRef.current,
      });
    },
    [questions, persist, navigation, kanaType, mode],
  );

  const nextQuestion = () => {
    if (!questions) return;
    if (current < questions.length - 1) {
      setCurrent((c) => c + 1);
      setSelected(null);
      setAnswered(false);
    } else {
      showResult(score);
    }
  };

  if (!questions) {
    return (
      <View style={styles.screen}>
        <AppHeader title="Kuis" />
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </View>
    );
  }

  if (mode === 'srs' && empty) {
    return (
      <View style={styles.screen}>
        <AppHeader
          title="Latihan Huruf Lemah"
          onBack={() => navigation.goBack()}
        />
        <View style={styles.emptyBox}>
          <Ionicons name="sparkles-outline" size={40} color={colors.primary} />
          <View style={styles.spacer10} />
          <Text style={styles.emptyTitle}>Belum ada huruf lemah</Text>
          <Text style={styles.emptyText}>
            Kamu belum punya jawaban salah di tipe ini. Kerjakan kuis biasa dulu
            supaya huruf tersimpan, lalu kembali ke sini.
          </Text>
          <View style={styles.spacer24} />
          <Button
            label="Ke Atur Kuis"
            icon="arrow-back"
            variant="outline"
            onPress={() => navigation.goBack()}
          />
        </View>
      </View>
    );
  }

  const item = questions[current];
  const isLast = current === questions.length - 1;

  return (
    <View style={styles.screen}>
      <AppHeader
        title={mode === 'srs' ? 'Latihan Huruf Lemah' : `Kuis ${kanaType}`}
        onBack={() => navigation.goBack()}
        right={
          <View style={styles.scoreBadge}>
            <Ionicons name="star" size={15} color={colors.accent} />
            <Text style={styles.scoreText}>{score}</Text>
          </View>
        }
      />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.centerColumn}>
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>
              Soal {current + 1} / {questions.length}
            </Text>
          </View>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${((current + 1) / questions.length) * 100}%` },
              ]}
            />
          </View>

          <View style={styles.spacer24} />
          <View style={styles.questionCard}>
            <Text style={styles.questionChar}>{item.kana.character}</Text>
            <Pressable
              style={styles.listenButton}
              hitSlop={8}
              onPress={() => kanaAudio.playRomaji(item.kana.romaji)}
            >
              <Ionicons name="volume-medium" size={18} color={colors.primary} />
              <Text style={styles.listenLabel}>{item.kana.romaji}</Text>
            </Pressable>
          </View>

          <View style={styles.spacer24} />
          <View style={styles.options}>
            {item.options.map((option) => {
              const isCorrect = option === item.kana.romaji;
              let borderColor: string = colors.border;
              let bg: string = colors.surface;
              let icon: keyof typeof Ionicons.glyphMap | null = null;
              let iconColor: string = colors.primary;
              if (answered) {
                const isSelectedOpt =
                  option === item.options[selected ?? -1];
                if (isCorrect) {
                  icon = 'checkmark-circle';
                  iconColor = colors.success;
                  bg = withAlpha(colors.success, 0.1);
                  borderColor = colors.success;
                } else if (isSelectedOpt) {
                  icon = 'close-circle';
                  iconColor = colors.error;
                  bg = withAlpha(colors.error, 0.08);
                  borderColor = colors.error;
                }
              }
              return (
                <Pressable
                  key={option}
                  onPress={() => selectAnswer(option)}
                  style={[styles.option, { backgroundColor: bg, borderColor }]}
                >
                  <Text style={styles.optionLabel}>{option}</Text>
                  {icon && (
                    <Ionicons name={icon} size={22} color={iconColor} />
                  )}
                </Pressable>
              );
            })}
          </View>

          {answered && (
            <>
              <View style={styles.spacer16} />
              <Button
                label={isLast ? 'Lihat Hasil' : 'Lanjut'}
                icon={isLast ? 'trophy' : 'arrow-forward'}
                variant="primary"
                onPress={nextQuestion}
              />
            </>
          )}
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
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: fontSize.title,
    fontFamily: fontFamily.semibold,
    color: colors.textPrimary,
  },
  emptyText: {
    marginTop: 8,
    fontSize: fontSize.body,
    lineHeight: 20,
    textAlign: 'center',
    fontFamily: fontFamily.regular,
    color: colors.textSecondary,
  },
  content: {
    padding: spacing.screen,
    alignItems: 'center',
  },
  centerColumn: {
    width: '100%',
    maxWidth: 480,
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: withAlpha(colors.accent, 0.14),
  },
  scoreText: {
    fontSize: 14,
    fontFamily: fontFamily.bold,
    color: colors.textPrimary,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: fontSize.label,
    fontFamily: fontFamily.medium,
    color: colors.textSecondary,
  },
  progressTrack: {
    marginTop: 10,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.surfaceMuted,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  questionCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 40,
    alignItems: 'center',
  },
  questionChar: {
    fontSize: 96,
    lineHeight: 116,
    fontFamily: fontFamily.kana,
    color: colors.textPrimary,
  },
  listenButton: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: withAlpha(colors.primary, 0.1),
  },
  listenLabel: {
    fontSize: fontSize.body,
    fontFamily: fontFamily.semibold,
    color: colors.primary,
  },
  options: {
    gap: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderRadius: radius.input,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  optionLabel: {
    fontSize: 18,
    fontFamily: fontFamily.medium,
    color: colors.textPrimary,
  },
  spacer10: { height: 10 },
  spacer16: { height: 16 },
  spacer24: { height: 24 },
});
