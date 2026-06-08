import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { PaperCard, PrimaryButton } from '@/components';
import { colors, shadows, spacing } from '@/theme';
import type { Country } from '@/types';

type StepCompleteProps = {
  selectedCountry: Country;
  visitedAt: string;
  cityNames: string[];
  onFinish: () => void;
};

export function StepComplete({ selectedCountry, visitedAt, cityNames, onFinish }: StepCompleteProps) {
  return (
    <View style={styles.block}>
      <View style={styles.completeBadge}>
        <Ionicons name="checkmark" size={46} color={colors.white} />
      </View>
      <PaperCard style={styles.completeCard}>
        <Text style={styles.largeFlag}>{selectedCountry.flag}</Text>
        <Text selectable style={styles.completeTitle}>
          登録が完了しました！
        </Text>
        <Text selectable style={styles.completeMeta}>
          {selectedCountry.nameJa}・{visitedAt}
        </Text>
        <Text selectable style={styles.completeMeta}>
          {cityNames.length > 0 ? cityNames.join('、') : '都市なし'}
        </Text>
      </PaperCard>
      <PrimaryButton label="完了" onPress={onFinish} />
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: spacing.md,
  },
  largeFlag: {
    fontSize: 44,
  },
  completeBadge: {
    alignSelf: 'center',
    width: 82,
    height: 82,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 41,
    backgroundColor: colors.visited,
    borderColor: '#DDF0DF',
    borderWidth: 6,
    boxShadow: shadows.button,
  },
  completeCard: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  completeTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '900',
  },
  completeMeta: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '700',
  },
});
