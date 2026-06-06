import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  AppScreen,
  BackIconButton,
  PremiumUpgradeCard,
} from '@/components';
import { getYearlyTravelSummaries, type YearlyCountryVisitSummary } from '@/features';
import { usePremium, usePremiumActions, useTravel } from '@/hooks';
import { spacing } from '@/theme';

import { MetricCard } from './_components/metric-card';
import { YearlyAnalysisHero } from './_components/yearly-analysis-hero';
import { YearCountrySection } from './_components/year-country-section';
import { YearSelector } from './_components/year-selector';
import { YearlyTrendChart } from './_components/yearly-trend-chart';

export default function YearlyAnalysisScreen() {
  const router = useRouter();
  const { data } = useTravel();
  const { isPremium } = usePremium();
  const { purchasePremiumWithFeedback, restorePremiumWithFeedback } = usePremiumActions();
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
        backgroundImage={require('../../assets/images/stats-travel-background.jpg')}
      >
        <PremiumUpgradeCard
          onPurchasePress={purchasePremiumWithFeedback}
          onRestorePress={restorePremiumWithFeedback}
        />
      </AppScreen>
    );
  }

  return (
    <AppScreen
      title="年別分析"
      subtitle="年ごとの旅の歩み"
      left={<BackIconButton onPress={() => router.back()} />}
      backgroundImage={require('../../assets/images/stats-travel-background.jpg')}
    >
      <YearlyAnalysisHero summary={selectedSummary} />

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
