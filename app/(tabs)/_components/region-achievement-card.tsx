import { StyleSheet, Text, View } from 'react-native';

import { PaperCard, ProgressBar, SectionTitle } from '@/components';
import { getRegionStats } from '@/features';
import { colors, spacing } from '@/theme';

type RegionStat = ReturnType<typeof getRegionStats>[number];

type RegionAchievementCardProps = {
  regionStats: RegionStat[];
};

export function RegionAchievementCard({ regionStats }: RegionAchievementCardProps) {
  return (
    <PaperCard inset style={styles.regionCard}>
      <SectionTitle title="地域別達成率" />
      {regionStats.map((stat) => (
        <View key={stat.region} style={styles.regionRow}>
          <Text selectable style={styles.regionLabel}>
            {stat.region}
          </Text>
          <View style={styles.regionProgress}>
            <ProgressBar value={stat.percentage} color={stat.color} />
          </View>
          <Text selectable style={styles.regionPercent}>
            {stat.percentage}%
          </Text>
        </View>
      ))}
    </PaperCard>
  );
}

const styles = StyleSheet.create({
  regionCard: {
    gap: spacing.md,
    backgroundColor: 'rgba(255, 249, 238, 0.92)',
    borderColor: '#DFC895',
  },
  regionRow: {
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  regionLabel: {
    width: 74,
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '800',
  },
  regionProgress: {
    flex: 1,
  },
  regionPercent: {
    width: 48,
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
});
