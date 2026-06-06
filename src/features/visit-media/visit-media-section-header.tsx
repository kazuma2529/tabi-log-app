import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, spacing, text } from '@/theme';

type VisitMediaSectionHeaderProps = {
  helperText: string;
  showSeeAll: boolean;
  onSeeAll: () => void;
};

export function VisitMediaSectionHeader({
  helperText,
  showSeeAll,
  onSeeAll,
}: VisitMediaSectionHeaderProps) {
  return (
    <>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="image-outline" size={18} color={colors.textPrimary} />
          <Text selectable style={styles.title}>
            思い出の写真
          </Text>
        </View>
        {showSeeAll ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="すべての思い出の写真を見る"
            hitSlop={6}
            onPress={onSeeAll}
          >
            <Text selectable style={styles.seeAll}>
              すべてを見る ›
            </Text>
          </Pressable>
        ) : null}
      </View>
      <Text selectable style={styles.helper}>
        {helperText}
      </Text>
    </>
  );
}

const styles = StyleSheet.create({
  helper: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: text.sectionTitle,
  seeAll: {
    color: colors.accentTealDark,
    fontSize: 13,
    fontWeight: '800',
  },
});
