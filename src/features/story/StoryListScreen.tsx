import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppHeader } from '../../components/AppHeader';
import { FadeSlideIn } from '../../components/FadeSlideIn';
import { ScaleTapCard } from '../../components/ScaleTapCard';
import { colors, radius, spacing, withAlpha } from '../../theme/theme';
import { fontFamily, fontSize } from '../../theme/typography';
import { storySource } from '../../data/storySource';
import { getStoryStats, type StoryStat } from '../../data/storyStore';
import type { RootStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function StoryListScreen() {
  const navigation = useNavigation<Nav>();
  const [stats, setStats] = useState<Record<string, StoryStat>>({});
  const stories = storySource.getStories();

  useFocusEffect(
    useCallback(() => {
      let active = true;
      getStoryStats().then((next) => {
        if (active) setStats(next);
      });
      return () => {
        active = false;
      };
    }, []),
  );

  return (
    <View style={styles.screen}>
      <AppHeader title="Cerita" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.centerColumn}>
          <FadeSlideIn style={styles.fullWidth}>
            <Text style={styles.intro}>
              Baca cerita pendek, lalu susun kana untuk menjawab pertanyaan.
              Nyalakan romaji kalau butuh bantuan.
            </Text>
          </FadeSlideIn>

          <View style={styles.spacer24} />

          {stories.map((story, i) => {
            const stat = stats[story.id];
            return (
              <FadeSlideIn
                key={story.id}
                delay={i * 50}
                style={styles.fullWidth}
              >
                <ScaleTapCard
                  onPress={() =>
                    navigation.navigate('Story', { storyId: story.id })
                  }
                  contentStyle={styles.cardContent}
                >
                  <View style={styles.cardRow}>
                    <View
                      style={[
                        styles.badge,
                        stat?.completed && styles.badgeDone,
                      ]}
                    >
                      <Text style={styles.badgeChar}>{story.title}</Text>
                    </View>
                    <View style={styles.cardText}>
                      <Text style={styles.cardTitle}>{story.titleId}</Text>
                      <Text style={styles.cardSubtitle}>
                        {story.questions.length} soal ·{' '}
                        {story.sentences.length} kalimat
                      </Text>
                    </View>
                    {stat?.completed ? (
                      <View style={styles.doneTag}>
                        <Ionicons
                          name="checkmark-circle"
                          size={16}
                          color={colors.success}
                        />
                        <Text style={styles.doneText}>
                          {stat.bestCorrect}/{stat.total}
                        </Text>
                      </View>
                    ) : (
                      <Ionicons
                        name="chevron-forward"
                        size={18}
                        color={colors.textSecondary}
                      />
                    )}
                  </View>
                </ScaleTapCard>
                <View style={styles.spacer12} />
              </FadeSlideIn>
            );
          })}
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
  intro: {
    fontSize: fontSize.body,
    lineHeight: 20,
    fontFamily: fontFamily.regular,
    color: colors.textSecondary,
  },
  cardContent: {
    padding: 16,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    width: 52,
    height: 52,
    borderRadius: radius.chip,
    backgroundColor: withAlpha(colors.primary, 0.12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeDone: {
    backgroundColor: withAlpha(colors.success, 0.16),
  },
  badgeChar: {
    fontSize: 22,
    fontFamily: fontFamily.kana,
    color: colors.textPrimary,
  },
  cardText: {
    flex: 1,
    marginLeft: 14,
  },
  cardTitle: {
    fontSize: fontSize.body,
    fontFamily: fontFamily.semibold,
    color: colors.textPrimary,
  },
  cardSubtitle: {
    marginTop: 2,
    fontSize: fontSize.caption + 1,
    fontFamily: fontFamily.regular,
    color: colors.textSecondary,
  },
  doneTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: withAlpha(colors.success, 0.12),
  },
  doneText: {
    fontSize: fontSize.label,
    fontFamily: fontFamily.semibold,
    color: colors.success,
  },
  spacer12: { height: 12 },
  spacer24: { height: 24 },
});
