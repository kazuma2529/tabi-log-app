import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import {
  AppScreen,
  PaperCard,
  PremiumUpgradeCard,
  PrimaryButton,
  ProgressDonut,
} from '@/components';
import { getRegionStats, getWorldProgress, getYearlyTravelSummaries } from '@/features';
import { usePremium, usePremiumDevActions, useTravel } from '@/hooks';
import { PREMIUM_UNLOCK_SHORT_COPY } from '@/lib';
import { colors, spacing } from '@/theme';

import { RegionAchievementCard } from './_components/region-achievement-card';
import { RegionDonutCard } from './_components/region-donut-card';

export default function StatsScreen() {
  const router = useRouter();
  const { data } = useTravel();
  const { isPremium } = usePremium();
  const { showRevenueCatPending, enableDevelopmentPremium, disableDevelopmentPremium } = usePremiumDevActions({
    enableMessage: '開発用フラグで有料機能を確認できます。',
  });
  const progress = getWorldProgress(data);
  const regionStats = getRegionStats(data);
  const yearlySummaries = getYearlyTravelSummaries(data);
  const latestYearlySummary = yearlySummaries[yearlySummaries.length - 1];

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

      <RegionAchievementCard regionStats={regionStats} />

      <RegionDonutCard regionStats={regionStats} />

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
