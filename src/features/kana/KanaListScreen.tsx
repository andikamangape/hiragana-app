import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
import type { Kana, KanaType } from '../../data/types';
import { kanaAudio } from '../../utils/kanaAudio';
import type { RootStackParamList } from '../../navigation/types';
import { KanaDetailSheet } from './KanaDetailSheet';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function KanaListScreen() {
  const navigation = useNavigation<Nav>();
  const [type, setType] = useState<KanaType>('hiragana');
  const [selected, setSelected] = useState<Kana | null>(null);

  const groups = useMemo(() => groupByRow(kanaSource.getKana(type)), [type]);

  return (
    <View style={styles.screen}>
      <AppHeader
        title="Hiragana & Katakana"
        onBack={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={styles.content}>
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

          {groups.map(([row, kanaList], i) => (
            <FadeSlideIn
              key={row}
              delay={i * 60}
              style={styles.groupBlock}
            >
              <RowHeader row={row} count={kanaList.length} />
              <View style={styles.grid}>
                {kanaList.map((kana) => (
                  <KanaCard
                    key={kana.character}
                    kana={kana}
                    onOpen={() => setSelected(kana)}
                  />
                ))}
              </View>
            </FadeSlideIn>
          ))}

          <View style={styles.spacer8} />
          <Button
            label="Mulai Kuis"
            icon="help-circle"
            variant="primary"
            onPress={() => navigation.navigate('QuizSetup')}
          />
        </View>
      </ScrollView>

      <KanaDetailSheet kana={selected} onClose={() => setSelected(null)} />
    </View>
  );
}

function RowHeader({ row, count }: { row: string; count: number }) {
  return (
    <View style={styles.rowHeader}>
      <Text style={styles.rowTitle}>Baris {row}</Text>
      <Text style={styles.rowCount}>{count} huruf</Text>
    </View>
  );
}

function KanaCard({ kana, onOpen }: { kana: Kana; onOpen: () => void }) {
  return (
    <Pressable style={styles.kanaCard} onPress={onOpen}>
      <Text style={styles.kanaChar}>{kana.character}</Text>
      <Text style={styles.kanaRomaji}>{kana.romaji}</Text>
      <Pressable
        style={styles.audioButton}
        hitSlop={6}
        onPress={() => kanaAudio.playRomaji(kana.romaji)}
      >
        <Ionicons name="volume-medium" size={16} color={colors.primary} />
      </Pressable>
    </Pressable>
  );
}

function groupByRow(kanaList: Kana[]): [string, Kana[]][] {
  const result: Record<string, Kana[]> = {};
  for (const kana of kanaList) {
    if (!result[kana.row]) result[kana.row] = [];
    result[kana.row].push(kana);
  }
  return Object.entries(result);
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
  groupBlock: {
    marginBottom: 24,
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  rowTitle: {
    fontSize: fontSize.label,
    fontFamily: fontFamily.semibold,
    letterSpacing: 0.4,
    color: colors.textSecondary,
  },
  rowCount: {
    marginLeft: 8,
    fontSize: fontSize.caption,
    fontFamily: fontFamily.regular,
    color: colors.textSecondary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  kanaCard: {
    width: '31%',
    aspectRatio: 0.92,
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.card,
  },
  kanaChar: {
    fontSize: 30,
    lineHeight: 38,
    fontFamily: fontFamily.kana,
    color: colors.textPrimary,
  },
  kanaRomaji: {
    marginTop: 2,
    fontSize: fontSize.caption + 1,
    fontFamily: fontFamily.medium,
    color: colors.textSecondary,
  },
  audioButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: withAlpha(colors.primary, 0.12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  spacer8: { height: 8 },
  spacer24: { height: 24 },
});
