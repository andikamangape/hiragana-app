import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '../../components/Button';
import { elevation, radius, spacing, withAlpha, type Palette } from '../../theme/theme';
import { useThemedStyles } from '../../theme/useThemedStyles';
import { useTheme } from '../../theme/ThemeProvider';
import { fontFamily, fontSize } from '../../theme/typography';
import type { Kana } from '../../data/types';
import { kanaAudio } from '../../utils/kanaAudio';

interface KanaDetailSheetProps {
  kana: Kana | null;
  onClose: () => void;
}

export function KanaDetailSheet({ kana, onClose }: KanaDetailSheetProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [failed, setFailed] = React.useState(false);

  const handlePlay = async () => {
    if (!kana) return;
    const ok = await kanaAudio.playRomaji(kana.romaji);
    setFailed(!ok);
  };

  return (
    <Modal
      visible={kana !== null}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        style={styles.backdrop}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Tutup detail huruf"
      >
        <Pressable style={[styles.sheet, elevation.raised]} onPress={() => {}}>
          <View style={styles.dragHandle} />
          {kana && (
            <ScrollView
              contentContainerStyle={[
                styles.content,
                { paddingBottom: spacing.screen + insets.bottom },
              ]}
            >
              <View style={styles.heroCard}>
                <Text style={styles.heroChar}>{kana.character}</Text>
              </View>

              <View style={styles.spacer24} />
              <Text style={styles.romaji}>{kana.romaji}</Text>
              <View style={styles.spacer8} />
              <Text style={styles.pronunciation}>
                Pengucapan: {kana.romaji}
              </Text>

              <View style={styles.spacer24} />
              <View style={styles.chips}>
                <Chip label={`Tersebut ${kana.type}`} />
                <Chip label={`Baris ${kana.row}`} />
                <Chip label={`${kana.strokeCount} garis`} />
              </View>

              <View style={styles.spacer24} />
              <Button
                label="Dengarkan"
                icon="volume-high"
                variant="primary"
                onPress={handlePlay}
              />
              {failed && (
                <View style={styles.failedBox}>
                  <Ionicons name="volume-mute" size={16} color={colors.error} />
                  <Text style={styles.failedText}>
                    Audio untuk {kana.romaji} belum tersedia di perangkat ini
                  </Text>
                </View>
              )}
            </ScrollView>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function Chip({ label }: { label: string }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.chip}>
      <Text style={styles.chipLabel}>{label}</Text>
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: '88%',
  },
  dragHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginTop: 10,
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  heroCard: {
    width: '100%',
    paddingVertical: 48,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    alignItems: 'center',
  },
  heroChar: {
    fontSize: 76,
    lineHeight: 92,
    fontFamily: fontFamily.kana,
    color: colors.textPrimary,
  },
  romaji: {
    fontSize: 24,
    fontFamily: fontFamily.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  pronunciation: {
    fontSize: fontSize.body,
    fontFamily: fontFamily.regular,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
  },
  chipLabel: {
    fontSize: fontSize.label,
    fontFamily: fontFamily.medium,
    color: colors.textSecondary,
  },
  failedBox: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radius.input,
    backgroundColor: withAlpha(colors.error, 0.08),
  },
  failedText: {
    fontSize: fontSize.label,
    fontFamily: fontFamily.regular,
    color: colors.error,
  },
  spacer8: { height: 8 },
  spacer24: { height: 24 },
  });
