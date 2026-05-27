import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { SectionTitle } from '@/components';
import { colors, radius, shadows, spacing } from '@/theme';

type YearSelectorProps = {
  years: number[];
  selectedYear: number;
  onSelectYear: (year: number) => void;
};

export function YearSelector({ years, selectedYear, onSelectYear }: YearSelectorProps) {
  return (
    <View style={styles.selectorBlock}>
      <SectionTitle title="年を選ぶ" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.yearPills}>
        {years.map((year) => {
          const active = year === selectedYear;
          return (
            <Pressable
              key={year}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={[styles.yearPill, active && styles.yearPillActive]}
              onPress={() => onSelectYear(year)}
            >
              <Text selectable style={[styles.yearPillText, active && styles.yearPillTextActive]}>
                {year}年
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  selectorBlock: {
    gap: spacing.sm,
  },
  yearPills: {
    gap: spacing.sm,
    paddingRight: spacing.lg,
  },
  yearPill: {
    minHeight: 42,
    minWidth: 86,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: radius.round,
    borderColor: colors.border,
    borderWidth: 1,
    backgroundColor: 'rgba(255, 250, 238, 0.94)',
    boxShadow: shadows.soft,
  },
  yearPillActive: {
    backgroundColor: colors.accentTealDark,
    borderColor: colors.accentTealDark,
  },
  yearPillText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  yearPillTextActive: {
    color: colors.white,
  },
});
