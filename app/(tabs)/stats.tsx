import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { AppScreen, DonutChart, PaperCard, ProgressBar, ProgressDonut, SectionTitle } from '@/components';
import { REGION_COLORS } from '@/constants';
import { getRegionStats, getVisitsByYear, getWorldProgress } from '@/features';
import { useTravel } from '@/hooks';
import { colors, spacing } from '@/theme';

export default function StatsScreen() {
  const { data } = useTravel();
  const progress = getWorldProgress(data);
  const regionStats = getRegionStats(data);
  const visitsByYear = getVisitsByYear(data);
  const donutSegments = regionStats.map((stat) => ({ value: stat.visited, color: stat.color }));

  return (
    <AppScreen title="統計" backgroundImage={require('../../assets/images/stats-travel-background.png')} headerAlign="center">
      <PaperCard style={styles.heroCard}>
        <View style={styles.heroText}>
          <Text selectable style={styles.cardLabel}>
            世界制覇率
          </Text>
          <Text selectable style={styles.bigPercent}>
            {progress.percentage}%
          </Text>
          <Text selectable style={styles.countText}>
            {progress.visited} / {progress.total} か国
          </Text>
        </View>
        <ProgressDonut percentage={progress.percentage} />
      </PaperCard>

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

      <PaperCard style={styles.lockCard}>
        <View style={styles.lockIcon}>
          <Ionicons name="lock-closed" size={24} color={colors.accentGold} />
        </View>
        <View style={styles.lockText}>
          <Text selectable style={styles.lockTitle}>
            年別分析
          </Text>
          <Text selectable style={styles.lockBody}>
            年ごとの訪問国、新規訪問国、推移グラフは有料版限定機能として後続フェーズでRevenueCatに接続します。
          </Text>
          {visitsByYear.length > 0 ? (
            <Text selectable style={styles.yearHint}>
              現在の記録年：{visitsByYear.map((item) => item.year).join('、')}
            </Text>
          ) : null}
        </View>
      </PaperCard>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    minHeight: 164,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    backgroundColor: 'rgba(255, 246, 229, 0.93)',
    borderColor: '#DCC28B',
  },
  heroText: {
    flex: 1,
    gap: spacing.xs,
  },
  cardLabel: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '900',
  },
  bigPercent: {
    color: colors.textPrimary,
    fontSize: 42,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  countText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '800',
  },
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
  lockCard: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: 'rgba(255, 240, 214, 0.92)',
    borderColor: '#DDBB78',
  },
  lockIcon: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 23,
    backgroundColor: '#F8DFA7',
  },
  lockText: {
    flex: 1,
    gap: spacing.xs,
  },
  lockTitle: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '900',
  },
  lockBody: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },
  yearHint: {
    color: colors.accentGold,
    fontSize: 12,
    fontWeight: '800',
  },
});
