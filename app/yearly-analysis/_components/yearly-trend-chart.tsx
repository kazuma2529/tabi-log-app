import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PaperCard, SectionTitle } from '@/components';
import { type YearlyTravelSummary } from '@/features';
import { colors, radius, spacing } from '@/theme';

type YearlyTrendChartProps = {
  summaries: YearlyTravelSummary[];
  selectedYear: number;
  onSelectYear: (year: number) => void;
};

export function YearlyTrendChart({ summaries, selectedYear, onSelectYear }: YearlyTrendChartProps) {
  const maxCountryCount = Math.max(...summaries.map((summary) => summary.countryCount), 1);

  return (
    <PaperCard inset style={styles.chartCard}>
      <SectionTitle title="年別推移グラフ" />
      <View style={styles.chartLegend}>
        <LegendDot color={colors.accentTealDark} label="訪問国" />
        <LegendDot color={colors.accentGoldLight} label="新規訪問国" />
      </View>
      <View style={styles.chartRows}>
        {summaries.map((summary) => {
          const active = summary.year === selectedYear;
          const countryWidth = `${Math.max((summary.countryCount / maxCountryCount) * 100, 6)}%` as `${number}%`;
          const newCountryWidth = `${Math.max((summary.newCountryCount / maxCountryCount) * 100, summary.newCountryCount > 0 ? 6 : 0)}%` as `${number}%`;

          return (
            <Pressable
              key={summary.year}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={[styles.chartRow, active && styles.chartRowActive]}
              onPress={() => onSelectYear(summary.year)}
            >
              <Text selectable style={[styles.chartYear, active && styles.chartYearActive]}>
                {summary.year}
              </Text>
              <View style={styles.barBlock}>
                <View style={styles.barRail}>
                  <View style={[styles.countryBar, { width: countryWidth }]} />
                  {summary.newCountryCount > 0 ? (
                    <View style={[styles.newCountryBar, { width: newCountryWidth }]} />
                  ) : null}
                </View>
                <Text selectable style={styles.barCaption}>
                  {summary.countryCount}か国 / 新規{summary.newCountryCount}か国
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </PaperCard>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text selectable style={styles.legendText}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chartCard: {
    gap: spacing.md,
    backgroundColor: 'rgba(255, 249, 238, 0.94)',
  },
  chartLegend: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '800',
  },
  chartRows: {
    gap: spacing.sm,
  },
  chartRow: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
  },
  chartRowActive: {
    backgroundColor: 'rgba(47, 155, 145, 0.08)',
  },
  chartYear: {
    width: 42,
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  chartYearActive: {
    color: colors.accentTealDark,
  },
  barBlock: {
    flex: 1,
    gap: 5,
  },
  barRail: {
    height: 16,
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: radius.round,
    backgroundColor: '#EFE0C5',
  },
  countryBar: {
    position: 'absolute',
    left: 0,
    height: 16,
    borderRadius: radius.round,
    backgroundColor: colors.accentTealDark,
  },
  newCountryBar: {
    position: 'absolute',
    left: 0,
    height: 8,
    borderRadius: radius.round,
    backgroundColor: colors.accentGoldLight,
  },
  barCaption: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '800',
  },
});
