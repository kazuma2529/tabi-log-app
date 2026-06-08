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
import { RegionAchievementCard } from '@/features/stats/region-achievement-card';
import { RegionDonutCard } from '@/features/stats/region-donut-card';
import { usePremium, usePremiumActions, useTravel } from '@/hooks';
import { colors, spacing } from '@/theme';

export default function StatsScreen() {
  const router = useRouter();
  const { data } = useTravel();
  const { isPremium } = usePremium();
  const { purchasePremiumWithFeedback, restorePremiumWithFeedback } = usePremiumActions();
  const progress = getWorldProgress(data);
  const regionStats = getRegionStats(data);
  const yearlySummaries = getYearlyTravelSummaries(data);
  const latestYearlySummary = yearlySummaries[yearlySummaries.length - 1];

  return (
    <AppScreen title="統計" backgroundImage={require('../../assets/images/stats-travel-background.jpg')} headerAlign="center">
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
          <View pointerEvents="none" style={styles.yearlyDecoration} />
          <View style={styles.yearlyHeader}>
            <View style={styles.yearlyIcon}>
              <Ionicons name="calendar" size={22} color="#FFF8E8" />
            </View>
            <View style={styles.yearlyText}>
              <Text selectable style={styles.yearlyEyebrow}>
                PREMIUM YEARBOOK
              </Text>
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
        </PaperCard>
      ) : (
        <PremiumUpgradeCard
          onPurchasePress={purchasePremiumWithFeedback}
          onRestorePress={restorePremiumWithFeedback}
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
    position: 'relative',
    overflow: 'hidden',
    gap: spacing.md,
    backgroundColor: 'rgba(255, 246, 226, 0.96)',
    borderColor: '#CF9E48',
    borderWidth: 1.5,
    boxShadow: '0 6px 18px rgba(112, 72, 20, 0.16)',
  },
  yearlyDecoration: {
    position: 'absolute',
    top: -62,
    right: -48,
    width: 138,
    height: 138,
    borderRadius: 69,
    backgroundColor: 'rgba(233, 187, 99, 0.16)',
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
    borderColor: '#E1BA6A',
    borderWidth: 2,
    backgroundColor: colors.accentGold,
    boxShadow: '0 4px 12px rgba(132, 82, 19, 0.20)',
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
  yearlyEyebrow: {
    color: colors.accentGold,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4,
  },
  yearlyBody: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },
});
