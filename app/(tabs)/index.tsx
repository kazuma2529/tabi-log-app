import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppScreen, CountryPhotoCard, EmptyState, SectionTitle } from '@/components';
import {
  getBucketCountries,
  getCountrySummaries,
  getLatestVisitedCountry,
  getMostVisitedCountry,
  getWorldProgress,
} from '@/features';
import { useTravel } from '@/hooks';
import { colors, spacing } from '@/theme';

import { HomeBucketSection } from './_components/home-bucket-section';
import { HomeSimpleStatsCard } from './_components/home-simple-stats-card';
import { WorldProgressCard } from './_components/world-progress-card';

export default function HomeScreen() {
  const router = useRouter();
  const { data, isReady, error } = useTravel();
  const progress = getWorldProgress(data);
  const recentCountries = getCountrySummaries(data);
  const mostVisited = getMostVisitedCountry(data);
  const latestVisited = getLatestVisitedCountry(data);
  const bucketCountries = getBucketCountries(data);

  return (
    <AppScreen sky>
      <View style={styles.homeHeader}>
        <Text selectable style={styles.homeTitle}>
          ホーム
        </Text>
      </View>

      {!isReady ? (
        <Text style={styles.statusText}>旅ノートを準備しています...</Text>
      ) : null}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <WorldProgressCard progress={progress} />

      <View style={styles.sectionGap}>
        <SectionTitle
          title="旅した国"
          action={
            <Pressable onPress={() => router.push('/visited-countries')}>
              <Text style={styles.smallLink}>すべて見る ›</Text>
            </Pressable>
          }
        />
        {recentCountries.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          >
            {recentCountries.map((summary) => (
              <CountryPhotoCard
                key={summary.country.id}
                summary={summary}
                compact
                onPress={() =>
                  router.push({
                    pathname: '/country/[countryId]',
                    params: { countryId: summary.country.id },
                  })
                }
              />
            ))}
          </ScrollView>
        ) : (
          <EmptyState
            icon="✈️"
            title="最初の国を登録しましょう"
            body="タップして、訪問した国・都市・写真・メモを残せます。"
            onPress={() => router.push('/add')}
          />
        )}
      </View>

      <HomeBucketSection bucketCountries={bucketCountries} />

      <HomeSimpleStatsCard mostVisited={mostVisited} latestVisited={latestVisited} />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  homeHeader: {
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 0,
    marginBottom: -12,
  },
  homeTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 0,
    textAlign: 'center',
  },
  statusText: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
  },
  sectionGap: {
    gap: spacing.md,
  },
  horizontalList: {
    gap: spacing.sm,
    paddingRight: spacing.lg,
  },
  smallLink: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '800',
  },
});
