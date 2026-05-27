import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  AppScreen,
  BackIconButton,
  EmptyState,
  PremiumUpgradeCard,
  PrimaryButton,
} from '@/components';
import { getYearlyTravelSummaries, type YearlyCountryVisitSummary } from '@/features';
import { usePremium, usePremiumDevActions, useTravel } from '@/hooks';
import { PREMIUM_UNLOCK_SHORT_COPY } from '@/lib';
import { spacing } from '@/theme';

import { MetricCard } from './_components/metric-card';
import { YearCountrySection } from './_components/year-country-section';
import { YearSelector } from './_components/year-selector';
import { YearlyTrendChart } from './_components/yearly-trend-chart';

export default function YearlyAnalysisScreen() {
  const router = useRouter();
  const { data } = useTravel();
  const { isPremium } = usePremium();
  const { showRevenueCatPending, enableDevelopmentPremium, disableDevelopmentPremium } = usePremiumDevActions({
    enableMessage: '開発用フラグで年別分析を確認できます。',
  });
  const summaries = useMemo(() => getYearlyTravelSummaries(data), [data]);
  const years = useMemo(() => summaries.map((summary) => summary.year).sort((a, b) => b - a), [summaries]);
  const [selectedYear, setSelectedYear] = useState<number | null>(years[0] ?? null);

  useEffect(() => {
    if (years.length === 0) {
      if (selectedYear !== null) {
        setSelectedYear(null);
      }
      return;
    }

    if (selectedYear === null || !years.includes(selectedYear)) {
      setSelectedYear(years[0]);
    }
  }, [selectedYear, years]);

  const selectedSummary = summaries.find((summary) => summary.year === selectedYear) ?? null;

  const openCountryVisit = (item: YearlyCountryVisitSummary) => {
    const visitId = item.visits[0]?.visit.id;
    if (!visitId) return;
    router.push({
      pathname: '/country/[countryId]',
      params: { countryId: item.country.id, visitId },
    });
  };

  if (!isPremium) {
    return (
      <AppScreen
        title="年別分析"
        subtitle="有料版限定"
        left={<BackIconButton onPress={() => router.back()} />}
        backgroundImage={require('../../assets/images/stats-travel-background.png')}
      >
        <PremiumUpgradeCard
          title="年別分析は有料版限定です"
          body={`年ごとの訪問国、新規訪問国、推移グラフをまとめて振り返れます。${PREMIUM_UNLOCK_SHORT_COPY}`}
          onPurchasePress={showRevenueCatPending}
          onRestorePress={showRevenueCatPending}
          onEnableDevelopmentPremium={__DEV__ ? enableDevelopmentPremium : undefined}
        />
      </AppScreen>
    );
  }

  return (
    <AppScreen
      title="年別分析"
      subtitle="年ごとの旅の歩み"
      left={<BackIconButton onPress={() => router.back()} />}
      backgroundImage={require('../../assets/images/stats-travel-background.png')}
    >
      {summaries.length === 0 ? (
        <>
          <EmptyState icon="📔" title="まだ分析できる記録がありません" body="訪問記録を追加すると、年ごとの訪問国と新規訪問国が表示されます。" />
          {__DEV__ ? (
            <PrimaryButton label="開発用：無料表示に戻す" variant="secondary" onPress={disableDevelopmentPremium} />
          ) : null}
        </>
      ) : null}

      {selectedSummary ? (
        <>
          <YearSelector years={years} selectedYear={selectedSummary.year} onSelectYear={setSelectedYear} />

          <View style={styles.metricGrid}>
            <MetricCard
              label="年間訪問国数"
              value={`${selectedSummary.countryCount}`}
              suffix="か国"
              icon="flag-outline"
            />
            <MetricCard
              label="新規訪問国数"
              value={`${selectedSummary.newCountryCount}`}
              suffix="か国"
              icon="sparkles-outline"
            />
            <MetricCard label="訪問記録" value={`${selectedSummary.visitCount}`} suffix="件" icon="albums-outline" />
          </View>

          <YearlyTrendChart summaries={summaries} selectedYear={selectedSummary.year} onSelectYear={setSelectedYear} />

          <YearCountrySection
            title={`${selectedSummary.year}年に訪問した国`}
            emptyTitle="この年の訪問国はありません"
            countries={selectedSummary.countries}
            onOpenCountry={openCountryVisit}
          />

          <YearCountrySection
            title="新規で訪れた国"
            emptyTitle="この年に初めて訪れた国はありません"
            countries={selectedSummary.newCountries}
            onOpenCountry={openCountryVisit}
          />

          {__DEV__ ? (
            <PrimaryButton label="開発用：無料表示に戻す" variant="secondary" onPress={disableDevelopmentPremium} />
          ) : null}
        </>
      ) : null}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  metricGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
});
