import { StyleSheet, Text, View } from 'react-native';

import { DonutChart, PaperCard } from '@/components';
import { REGION_COLORS } from '@/constants';
import { getRegionStats } from '@/features';
import { colors, spacing } from '@/theme';

type RegionStat = ReturnType<typeof getRegionStats>[number];

type RegionDonutCardProps = {
  regionStats: RegionStat[];
};

export function RegionDonutCard({ regionStats }: RegionDonutCardProps) {
  const donutSegments = regionStats.map((stat) => ({ value: stat.visited, color: stat.color }));

  return (
    <PaperCard inset style={styles.donutCard}>
      <View style={styles.donutWrap}>
        <DonutChart segments={donutSegments} />
      </View>
      <View style={styles.legendList}>
        {regionStats.map((stat) => (
          <View key={stat.region} style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: REGION_COLORS[stat.region] }]} />
            <Text selectable style={styles.legendName}>
              {stat.region}
            </Text>
            <Text selectable style={styles.legendValue}>
              {stat.visited} / {stat.total}
            </Text>
          </View>
        ))}
      </View>
    </PaperCard>
  );
}

const styles = StyleSheet.create({
  donutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    backgroundColor: 'rgba(255, 249, 238, 0.92)',
    borderColor: '#DFC895',
  },
  donutWrap: {
    width: 148,
    alignItems: 'center',
  },
  legendList: {
    flex: 1,
    gap: spacing.sm,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendName: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '800',
  },
  legendValue: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
});
