import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppScreen, CountryRow, PaperCard, SearchInput } from '@/components';
import { COUNTRIES, searchCountries } from '@/data';
import { isCountryInBucket } from '@/features';
import { useTravel } from '@/hooks';
import { colors, spacing } from '@/theme';

export default function BucketListAddScreen() {
  const router = useRouter();
  const { data, addBucketCountry } = useTravel();
  const [query, setQuery] = useState('');
  const results = useMemo(() => searchCountries(query).slice(0, 12), [query]);
  const suggestions = useMemo(() => COUNTRIES.slice(0, 6), []);

  async function handleAdd(countryId: string) {
    if (isCountryInBucket(data, countryId)) {
      Alert.alert('追加済みです', 'すでに行ってみたい国に登録されています。');
      return;
    }

    await addBucketCountry(countryId);
    setQuery('');
  }

  return (
    <AppScreen
      title="行きたい国を追加"
      right={
        <Pressable accessibilityRole="button" accessibilityLabel="閉じる" style={styles.closeButton} onPress={() => router.back()}>
          <Ionicons name="close" size={22} color={colors.textPrimary} />
        </Pressable>
      }
    >
      <PaperCard inset style={styles.searchCard}>
        <SearchInput value={query} onChangeText={setQuery} placeholder="国名で検索" />
        {query.trim().length > 0 ? (
          <View style={styles.results}>
            {results.length > 0 ? (
              results.map((country) => (
                <CountryRow
                  key={country.id}
                  country={country}
                  meta={isCountryInBucket(data, country.id) ? '追加済み' : 'タップして追加'}
                  actionIcon={isCountryInBucket(data, country.id) ? 'checkmark' : 'add-circle'}
                  onPress={() => handleAdd(country.id)}
                />
              ))
            ) : (
              <Text selectable style={styles.notFound}>
                該当する国が見つかりませんでした。
              </Text>
            )}
          </View>
        ) : null}
      </PaperCard>

      {query.trim().length === 0 ? (
        <View style={styles.suggestBlock}>
          <Text selectable style={styles.suggestTitle}>
            おすすめ
          </Text>
          <View style={styles.suggestList}>
            {suggestions.map((country) => (
              <CountryRow
                key={country.id}
                country={country}
                meta={isCountryInBucket(data, country.id) ? '追加済み' : 'タップして追加'}
                actionIcon={isCountryInBucket(data, country.id) ? 'checkmark' : 'add-circle'}
                onPress={() => handleAdd(country.id)}
              />
            ))}
          </View>
        </View>
      ) : null}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  closeButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 21,
    backgroundColor: colors.paper,
    borderColor: colors.border,
    borderWidth: 1,
  },
  searchCard: {
    gap: spacing.md,
  },
  results: {
    gap: spacing.sm,
  },
  notFound: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },
  suggestBlock: {
    gap: spacing.sm,
  },
  suggestTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '900',
  },
  suggestList: {
    gap: spacing.sm,
  },
});
