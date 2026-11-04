import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppHeader } from '../../components/AppHeader';
import { Button } from '../../components/Button';
import { FadeSlideIn } from '../../components/FadeSlideIn';
import { elevation, radius, spacing, withAlpha, type Palette } from '../../theme/theme';
import { useThemedStyles } from '../../theme/useThemedStyles';
import { useTheme } from '../../theme/ThemeProvider';
import { fontFamily, fontSize } from '../../theme/typography';
import { storySource } from '../../data/storySource';
import { storyStore } from '../../data/storyStore';
import type { RootStackParamList, StoryWrongItem } from '../../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type StoryRoute = RouteProp<RootStackParamList, 'Story'>;

interface BankTile {
  id: number;
  char: string;
}

function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function StoryScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<StoryRoute>();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { storyId } = route.params;
  const story = useMemo(() => storySource.getStory(storyId), [storyId]);

  const [romajiOn, setRomajiOn] = useState(false);
  const [current, setCurrent] = useState(0);
  const [pool, setPool] = useState<BankTile[]>([]);
  const [answer, setAnswer] = useState<BankTile[]>([]);
  const [answered, setAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const wrongRef = React.useRef<StoryWrongItem[]>([]);

  const question = story?.questions[current];
  const total = story?.questions.length ?? 0;

  useEffect(() => {
    if (!story) return;
    let active = true;
    Promise.resolve().then(() => {
      if (!active) return;
      const q = story.questions[current];
      const tiles = shuffle(q.bank.map((char, id) => ({ id, char })));
      setPool(tiles);
      setAnswer([]);
      setAnswered(false);
    });
    return () => {
      active = false;
    };
  }, [story, current]);

  const persistAndShow = useCallback(
    async (finalCorrect: number) => {
      await storyStore.recordStoryResult({
        storyId,
        correct: finalCorrect,
        total,
        date: new Date().toISOString(),
      });
      navigation.replace('StoryResult', {
        storyId,
        correct: finalCorrect,
        total,
        wrong: wrongRef.current,
      });
    },
    [storyId, total, navigation],
  );

  if (!story) {
    return (
      <View style={styles.screen}>
        <AppHeader title="Cerita" onBack={() => navigation.goBack()} />
        <View style={styles.center}>
          <Ionicons name="alert-circle" size={40} color={colors.error} />
          <Text style={styles.emptyText}>Cerita tidak ditemukan.</Text>
        </View>
      </View>
    );
  }

  const isLast = current === total - 1;
  const expected = question ? question.answerKana.join('') : '';
  const currentAnswer = answer.map((t) => t.char).join('');

  const pickFromBank = (tile: BankTile) => {
    if (answered) return;
    setPool((p) => p.filter((t) => t.id !== tile.id));
    setAnswer((a) => [...a, tile]);
  };

  const returnToBank = (tile: BankTile) => {
    if (answered) return;
    setAnswer((a) => a.filter((t) => t.id !== tile.id));
    setPool((p) => [...p, tile]);
  };

  const check = () => {
    if (!question || answered) return;
    const isCorrect = currentAnswer === expected;
    setAnswered(true);
    if (isCorrect) {
      setCorrectCount((c) => c + 1);
    } else {
      wrongRef.current.push({
        prompt: question.prompt,
        answerId: question.answerId,
      });
    }
  };

  const next = () => {
    if (isLast) {
      persistAndShow(correctCount);
    } else {
      setCurrent((c) => c + 1);
    }
  };

  const isCorrectAnswer = answered && currentAnswer === expected;

  return (
    <View style={styles.screen}>
      <AppHeader
        title={story.titleId}
        onBack={() => navigation.goBack()}
        right={
          <View style={styles.scoreBadge}>
            <Ionicons name="star" size={15} color={colors.accent} />
            <Text style={styles.scoreText}>{correctCount}</Text>
          </View>
        }
      />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: spacing.screen + insets.bottom },
        ]}
      >
        <View style={styles.centerColumn}>
          <View style={styles.storyCard}>
            {story.sentences.map((sentence, index) => (
              <View
                key={sentence.kana}
                style={[styles.sentenceBlock, index > 0 && styles.sentenceGap]}
              >
                <Text style={styles.sentenceKana}>{sentence.kana}</Text>
                {romajiOn && (
                  <Text style={styles.sentenceRomaji}>{sentence.romaji}</Text>
                )}
                <Text style={styles.sentenceId}>{sentence.id}</Text>
              </View>
            ))}
            <View style={styles.romajiToggle}>
              <Text style={styles.romajiToggleLabel}>Romaji</Text>
              <Switch
                value={romajiOn}
                onValueChange={setRomajiOn}
                accessibilityLabel="Tampilkan romaji"
                trackColor={{ true: colors.primary, false: colors.border }}
                thumbColor={colors.surface}
                ios_backgroundColor={colors.border}
              />
            </View>
          </View>

          <View style={styles.spacer24} />

          <FadeSlideIn style={styles.fullWidth}>
            <View style={styles.questionCard}>
              <Text style={styles.questionMeta}>
                Soal {current + 1} / {total}
              </Text>
              <Text style={styles.questionPrompt}>{question?.prompt}</Text>

              <View style={styles.spacer16} />

              <View style={styles.answerRow}>
                {answer.length === 0 && (
                  <Text style={styles.answerPlaceholder}>
                    Susun kana di sini…
                  </Text>
                )}
                {answer.map((tile) => (
                  <Pressable
                    key={tile.id}
                    onPress={() => returnToBank(tile)}
                    accessibilityRole="button"
                    accessibilityLabel={`Kembalikan kana ${tile.char}`}
                    style={[
                      styles.tile,
                      answered &&
                        (isCorrectAnswer ? styles.tileOk : styles.tileBad),
                    ]}
                  >
                    <Text style={styles.tileChar}>{tile.char}</Text>
                  </Pressable>
                ))}
              </View>

              {answered && !isCorrectAnswer && (
                <Text style={styles.correctHint}>
                  Jawaban benar: {expected} ({question?.answerId})
                </Text>
              )}
            </View>
          </FadeSlideIn>

          <View style={styles.spacer16} />

          <FadeSlideIn style={styles.fullWidth}>
            <View style={styles.bankRow}>
              {pool.map((tile) => (
                <Pressable
                  key={tile.id}
                  onPress={() => pickFromBank(tile)}
                  accessibilityRole="button"
                  accessibilityLabel={`Pilih kana ${tile.char}`}
                  style={styles.tile}
                >
                  <Text style={styles.tileChar}>{tile.char}</Text>
                </Pressable>
              ))}
            </View>
          </FadeSlideIn>

          <View style={styles.spacer24} />

          <FadeSlideIn style={styles.fullWidth}>
            {answered ? (
              <Button
                label={isLast ? 'Lihat Hasil' : 'Lanjut'}
                icon={isLast ? 'trophy' : 'arrow-forward'}
                variant="primary"
                onPress={next}
              />
            ) : (
              <Button
                label="Periksa"
                icon="checkmark"
                variant="primary"
                disabled={answer.length === 0}
                onPress={check}
              />
            )}
          </FadeSlideIn>
        </View>
      </ScrollView>
    </View>
  );
}

const TILE = 52;

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    marginTop: 12,
    fontSize: fontSize.body,
    fontFamily: fontFamily.regular,
    color: colors.textSecondary,
    textAlign: 'center',
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
  storyCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    ...elevation.card,
  },
  sentenceBlock: {},
  sentenceGap: {
    marginTop: 16,
  },
  sentenceKana: {
    fontSize: 22,
    lineHeight: 32,
    fontFamily: fontFamily.kana,
    color: colors.textPrimary,
  },
  sentenceRomaji: {
    marginTop: 2,
    fontSize: fontSize.label,
    fontFamily: fontFamily.regular,
    color: colors.primary,
  },
  sentenceId: {
    marginTop: 2,
    fontSize: fontSize.label,
    fontFamily: fontFamily.regular,
    color: colors.textSecondary,
  },
  romajiToggle: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  romajiToggleLabel: {
    fontSize: fontSize.body,
    fontFamily: fontFamily.medium,
    color: colors.textSecondary,
  },
  questionCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    ...elevation.card,
  },
  questionMeta: {
    fontSize: fontSize.caption,
    fontFamily: fontFamily.medium,
    color: colors.textSecondary,
  },
  questionPrompt: {
    marginTop: 6,
    fontSize: fontSize.h2,
    fontFamily: fontFamily.semibold,
    color: colors.textPrimary,
  },
  answerRow: {
    minHeight: TILE,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    borderRadius: radius.input,
    padding: 8,
  },
  answerPlaceholder: {
    fontSize: fontSize.body,
    fontFamily: fontFamily.regular,
    color: colors.textSecondary,
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  bankRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tile: {
    width: TILE,
    height: TILE,
    borderRadius: radius.chip,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...elevation.card,
  },
  tileOk: {
    backgroundColor: withAlpha(colors.success, 0.14),
    borderColor: colors.success,
  },
  tileBad: {
    backgroundColor: withAlpha(colors.error, 0.1),
    borderColor: colors.error,
  },
  tileChar: {
    fontSize: 24,
    fontFamily: fontFamily.kana,
    color: colors.textPrimary,
  },
  correctHint: {
    marginTop: 12,
    fontSize: fontSize.label,
    fontFamily: fontFamily.medium,
    color: colors.error,
  },
  spacer16: { height: 16 },
  spacer24: { height: 24 },
  });
