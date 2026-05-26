import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Alert, StyleSheet, Text, View } from 'react-native';

import {
  AppScreen,
  DonutChart,
  PaperCard,
  PremiumUpgradeCard,
  PrimaryButton,
  ProgressBar,
  ProgressDonut,
  SectionTitle,
} from '@/components';
import { REGION_COLORS } from '@/constants';
import { getRegionStats, getWorldProgress, getYearlyTravelSummaries } from '@/features';
import { usePremium, useTravel } from '@/hooks';
import { PREMIUM_REVENUECAT_PENDING_MESSAGE, PREMIUM_UNLOCK_SHORT_COPY } from '@/lib';
import { colors, spacing } from '@/theme';

export default function StatsScreen() {
  const router = useRouter();
  const { data } = useTravel();
  const { isPremium, setDevelopmentPremium } = usePremium();
  const progress = getWorldProgress(data);
  const regionStats = getRegionStats(data);
  const yearlySummaries = getYearlyTravelSummaries(data);
  const latestYearlySummary = yearlySummaries[yearlySummaries.length - 1];
  const donutSegments = regionStats.map((stat) => ({ value: stat.visited, color: stat.color }));
  const showRevenueCatPending = () => {
    Alert.alert('RevenueCat 接続前です', PREMIUM_REVENUECAT_PENDING_MESSAGE);
  };
  const enableDevelopmentPremium = async () => {
    await setDevelopmentPremium(true);
    Alert.alert('有料表示にしました', '開発用フラグで有料機能を確認できます。');
  };
  const disableDevelopmentPremium = async () => {
    await setDevelopmentPremium(false);
    Alert.alert('無料表示に戻しました', '開発用フラグをオフにしました。');
  };

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

      {isPremium ? (
        <PaperCard style={styles.yearlyCard}>
          <View style={styles.yearlyHeader}>
            <View style={styles.yearlyIcon}>
              <Ionicons name="calendar" size={23} color={colors.accentTealDark} />
            </View>
            <View style={styles.yearlyText}>
              <Text selectable style={styles.yearlyTitle}>
                年別分析
              </Text>
              <Text selectable style={styles.yearlyBody}>
                {latestYearlySummary
                  ? `${latestYearlySummary.year}年は${latestYearlySummary.countryCount}か国を訪問し、新規で${latestYearlySummary.newCountryCount}か国が増えました。`
                  : '訪問記録が増えると、年ごとの訪問国と新規訪問国を振り返れます。'}
              </Text>
            </View>
          </View>
          <PrimaryButton label="年別分析を見る" onPress={() => router.push('/yearly-analysis')} />
          {__DEV__ ? (
            <PrimaryButton label="開発用：無料表示に戻す" variant="secondary" onPress={disableDevelopmentPremium} />
          ) : null}
        </PaperCard>
      ) : (
        <PremiumUpgradeCard
          title="年別分析"
          body={`年ごとの訪問国、新規訪問国、推移グラフを振り返れます。${PREMIUM_UNLOCK_SHORT_COPY}`}
          onPurchasePress={showRevenueCatPending}
          onRestorePress={showRevenueCatPending}
          onEnableDevelopmentPremium={__DEV__ ? enableDevelopmentPremium : undefined}
        />
      )}
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
  yearlyCard: {
    gap: spacing.md,
    backgroundColor: 'rgba(235, 247, 242, 0.94)',
    borderColor: '#A8D4C7',
  },
  yearlyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  yearlyIcon: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 23,
    backgroundColor: '#D8EFE8',
  },
  yearlyText: {
    flex: 1,
    gap: spacing.xs,
  },
  yearlyTitle: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '900',
  },
  yearlyBody: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },
});
