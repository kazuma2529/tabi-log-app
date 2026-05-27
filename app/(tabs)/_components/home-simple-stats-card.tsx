import { StyleSheet, Text, View } from 'react-native';

import { PaperCard } from '@/components';
import { formatDateSlash } from '@/lib';
import { colors, spacing } from '@/theme';
import type { CountrySummary } from '@/types';

type HomeSimpleStatsCardProps = {
  mostVisited: CountrySummary | undefined;
  latestVisited: CountrySummary | undefined;
};

export function HomeSimpleStatsCard({ mostVisited, latestVisited }: HomeSimpleStatsCardProps) {
  const showMostVisited = mostVisited != null && mostVisited.visitCount >= 2;

  return (
    <PaperCard inset style={styles.statsCard}>
      <Text selectable style={styles.statsTitle}>
        簡単な統計
      </Text>
      {showMostVisited ? (
        <StatLine
          icon={mostVisited.country.flag}
          label="最も訪問回数が多い国"
          value={`${mostVisited.country.nameJa}（${mostVisited.visitCount}回）`}
        />
      ) : null}
      <StatLine
        icon={latestVisited?.country.flag ?? '✈️'}
        label="最後に訪問した国"
        value={
          latestVisited
            ? `${latestVisited.country.nameJa}  ${formatDateSlash(latestVisited.lastVisitedAt)}`
            : 'まだありません'
        }
      />
    </PaperCard>
  );
}

function StatLine({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.statLine}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text selectable style={styles.statLabel}>
        {label}
      </Text>
      <Text selectable style={styles.statValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  statsCard: {
    gap: spacing.sm,
    backgroundColor: 'rgba(255, 248, 232, 0.93)',
  },
  statsTitle: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '900',
  },
  statLine: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(109, 90, 66, 0.14)',
  },
  statIcon: {
    width: 28,
    fontSize: 21,
    lineHeight: 28,
  },
  statLabel: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  statValue: {
    maxWidth: 132,
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'right',
  },
});
