import { useRouter } from 'expo-router';
import { Alert, Dimensions, StyleSheet, Text, View } from 'react-native';

import { AppScreen, CountryPhotoCard, EmptyState, SectionTitle, WorldMap } from '@/components';
import { getBucketCountries, getCountrySummaries, getVisitedCountryIds } from '@/features';
import { useTravel } from '@/hooks';
import { colors, spacing } from '@/theme';
import type { Country } from '@/types';

const CARDS_PER_ROW = 3;
const CARD_GAP = spacing.sm;
const SCREEN_HORIZONTAL_PADDING = spacing.lg;
const CARD_WIDTH =
  (Dimensions.get('window').width - SCREEN_HORIZONTAL_PADDING * 2 - CARD_GAP * (CARDS_PER_ROW - 1)) /
  CARDS_PER_ROW;

export default function MapScreen() {
  const router = useRouter();
  const { data, addBucketCountry } = useTravel();
  const visitedIds = getVisitedCountryIds(data);
  const bucketIds = new Set(getBucketCountries(data).map((country) => country.id));
  const summaries = getCountrySummaries(data);

  async function handleAddBucket(country: Country) {
    if (bucketIds.has(country.id)) {
      Alert.alert('追加済みです', 'すでにバケットリストに追加されています。');
      return;
    }
    await addBucketCountry(country.id);
    Alert.alert('追加しました', `${country.nameJa}をバケットリストに追加しました。`);
  }

  return (
    <AppScreen backgroundImage={require('../../assets/images/map-travel-background.png')}>
      <View style={styles.mapHeader}>
        <Text selectable style={styles.mapTitle}>
          世界地図
        </Text>
      </View>

      <WorldMap
        visitedCountryIds={visitedIds}
        bucketCountryIds={bucketIds}
        onOpenCountry={(country) => router.push({ pathname: '/country/[countryId]', params: { countryId: country.id } })}
        onAddVisit={(country) => router.push({ pathname: '/add', params: { countryId: country.id } })}
        onAddBucket={handleAddBucket}
      />

      <View style={styles.section}>
        <SectionTitle title={`訪問済みの国　${visitedIds.size}か国`} />
        {summaries.length > 0 ? (
          <View style={styles.gridList}>
            {summaries.map((summary) => (
              <CountryPhotoCard
                key={summary.country.id}
                summary={summary}
                compact
                style={styles.gridCard}
                onPress={() => router.push({ pathname: '/country/[countryId]', params: { countryId: summary.country.id } })}
              />
            ))}
          </View>
        ) : (
          <EmptyState icon="🗺️" title="まだ訪問済みの国がありません" body="地図上の国をタップして訪問記録を追加できます。" />
        )}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  mapHeader: {
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: -8,
  },
  mapTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 0,
    textAlign: 'center',
  },
  section: {
    gap: spacing.md,
  },
  gridList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: CARD_GAP,
    rowGap: CARD_GAP,
  },
  gridCard: {
    width: CARD_WIDTH,
  },
});
