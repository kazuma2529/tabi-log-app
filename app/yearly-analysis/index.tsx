import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  AppScreen,
  BackIconButton,
  EmptyState,
  PaperCard,
  PremiumUpgradeCard,
  PrimaryButton,
  SectionTitle,
} from '@/components';
import {
  getYearlyTravelSummaries,
  type YearlyCountryVisitSummary,
  type YearlyTravelSummary,
} from '@/features';
import { usePremium, useTravel } from '@/hooks';
import { formatDateSlash, PREMIUM_REVENUECAT_PENDING_MESSAGE, PREMIUM_UNLOCK_SHORT_COPY } from '@/lib';
import { colors, radius, shadows, spacing } from '@/theme';
import type { VisitBundle } from '@/types';

export default function YearlyAnalysisScreen() {
  const router = useRouter();
  const { data } = useTravel();
  const { isPremium, setDevelopmentPremium } = usePremium();
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

  const showRevenueCatPending = () => {
    Alert.alert('RevenueCat 接続前です', PREMIUM_REVENUECAT_PENDING_MESSAGE);
  };

  const enableDevelopmentPremium = async () => {
    await setDevelopmentPremium(true);
    Alert.alert('有料表示にしました', '開発用フラグで年別分析を確認できます。');
  };

  const disableDevelopmentPremium = async () => {
    await setDevelopmentPremium(false);
    Alert.alert('無料表示に戻しました', '開発用フラグをオフにしました。');
  };

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

function YearSelector({
  years,
  selectedYear,
  onSelectYear,
}: {
  years: number[];
  selectedYear: number;
  onSelectYear: (year: number) => void;
}) {
  return (
    <View style={styles.selectorBlock}>
      <SectionTitle title="年を選ぶ" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.yearPills}>
        {years.map((year) => {
          const active = year === selectedYear;
          return (
            <Pressable
              key={year}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={[styles.yearPill, active && styles.yearPillActive]}
              onPress={() => onSelectYear(year)}
            >
              <Text selectable style={[styles.yearPillText, active && styles.yearPillTextActive]}>
                {year}年
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

function MetricCard({
  label,
  value,
  suffix,
  icon,
}: {
  label: string;
  value: string;
  suffix: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <PaperCard inset style={styles.metricCard}>
      <Ionicons name={icon} size={18} color={colors.accentTealDark} />
      <Text selectable style={styles.metricLabel}>
        {label}
      </Text>
      <Text selectable style={styles.metricValue}>
        {value}
        <Text style={styles.metricSuffix}> {suffix}</Text>
      </Text>
    </PaperCard>
  );
}

function YearlyTrendChart({
  summaries,
  selectedYear,
  onSelectYear,
}: {
  summaries: YearlyTravelSummary[];
  selectedYear: number;
  onSelectYear: (year: number) => void;
}) {
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

function YearCountrySection({
  title,
  emptyTitle,
  countries,
  onOpenCountry,
}: {
  title: string;
  emptyTitle: string;
  countries: YearlyCountryVisitSummary[];
  onOpenCountry: (item: YearlyCountryVisitSummary) => void;
}) {
  return (
    <View style={styles.countrySection}>
      <SectionTitle title={title} />
      {countries.length > 0 ? (
        <View style={styles.countryList}>
          {countries.map((item) => (
            <YearCountryRow key={item.country.id} item={item} onPress={() => onOpenCountry(item)} />
          ))}
        </View>
      ) : (
        <PaperCard inset style={styles.emptyMiniCard}>
          <Text selectable style={styles.emptyMiniText}>
            {emptyTitle}
          </Text>
        </PaperCard>
      )}
    </View>
  );
}

function YearCountryRow({ item, onPress }: { item: YearlyCountryVisitSummary; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" style={({ pressed }) => [styles.countryRow, pressed && styles.pressed]} onPress={onPress}>
      <Text style={styles.countryFlag}>{item.country.flag}</Text>
      <View style={styles.countryText}>
        <View style={styles.countryNameRow}>
          <Text selectable style={styles.countryName}>
            {item.country.nameJa}
          </Text>
          {item.isNewCountry ? (
            <View style={styles.newBadge}>
              <Text selectable style={styles.newBadgeText}>
                NEW
              </Text>
            </View>
          ) : null}
        </View>
        <Text selectable style={styles.countryMeta}>
          {formatVisitDates(item.visits)}・{formatVisitCities(item.visits)}
        </Text>
      </View>
      <Text selectable style={styles.visitCount}>
        {item.visits.length}回
      </Text>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </Pressable>
  );
}

function formatVisitDates(visits: VisitBundle[]) {
  const dates = visits.map((bundle) => formatDateSlash(bundle.visit.visitedAt));
  if (dates.length <= 1) {
    return dates[0] ?? '';
  }
  return `${dates[0]} ほか${dates.length - 1}回`;
}

function formatVisitCities(visits: VisitBundle[]) {
  const cityNames = Array.from(new Set(visits.flatMap((bundle) => bundle.cities.map((city) => city.name))));
  if (cityNames.length === 0) {
    return '都市未登録';
  }
  const visibleCities = cityNames.slice(0, 3).join('、');
  return cityNames.length > 3 ? `${visibleCities} ほか` : visibleCities;
}

const styles = StyleSheet.create({
  selectorBlock: {
    gap: spacing.sm,
  },
  yearPills: {
    gap: spacing.sm,
    paddingRight: spacing.lg,
  },
  yearPill: {
    minHeight: 42,
    minWidth: 86,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: radius.round,
    borderColor: colors.border,
    borderWidth: 1,
    backgroundColor: 'rgba(255, 250, 238, 0.94)',
    boxShadow: shadows.soft,
  },
  yearPillActive: {
    backgroundColor: colors.accentTealDark,
    borderColor: colors.accentTealDark,
  },
  yearPillText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  yearPillTextActive: {
    color: colors.white,
  },
  metricGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  metricCard: {
    flex: 1,
    minHeight: 116,
    gap: spacing.xs,
    backgroundColor: 'rgba(255, 249, 238, 0.94)',
  },
  metricLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 16,
  },
  metricValue: {
    color: colors.textPrimary,
    fontSize: 30,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  metricSuffix: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '800',
  },
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
  countrySection: {
    gap: spacing.sm,
  },
  countryList: {
    gap: spacing.sm,
  },
  countryRow: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderColor: colors.border,
    borderWidth: 1,
    backgroundColor: 'rgba(255, 250, 238, 0.95)',
  },
  pressed: {
    opacity: 0.82,
  },
  countryFlag: {
    width: 38,
    textAlign: 'center',
    fontSize: 30,
  },
  countryText: {
    flex: 1,
    gap: 4,
  },
  countryNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  countryName: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '900',
  },
  countryMeta: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
  },
  newBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.round,
    backgroundColor: '#F5DDA7',
  },
  newBadgeText: {
    color: colors.accentGold,
    fontSize: 10,
    fontWeight: '900',
  },
  visitCount: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  emptyMiniCard: {
    minHeight: 58,
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 249, 238, 0.86)',
  },
  emptyMiniText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '800',
  },
});
