import { StyleSheet, View } from 'react-native';

import { CountryRow, SearchInput } from '@/components';
import { colors, radius, spacing } from '@/theme';
import type { Country } from '@/types';

import { SegmentButton } from '../_components/segment-button';
import { type CountryFilter } from '../_constants';

type StepCountryProps = {
  countries: Country[];
  countryId: string;
  visitCountByCountry: Record<string, number>;
  countryQuery: string;
  onChangeQuery: (value: string) => void;
  filter: CountryFilter;
  onChangeFilter: (filter: CountryFilter) => void;
  onSelectCountry: (id: string) => void;
};

export function StepCountry({
  countries,
  countryId,
  visitCountByCountry,
  countryQuery,
  onChangeQuery,
  filter,
  onChangeFilter,
  onSelectCountry,
}: StepCountryProps) {
  return (
    <View style={styles.block}>
      <SearchInput value={countryQuery} onChangeText={onChangeQuery} placeholder="国名で検索" />
      <View style={styles.segment}>
        <SegmentButton label="すべて" active={filter === 'all'} onPress={() => onChangeFilter('all')} />
        <SegmentButton label="訪問済み" active={filter === 'visited'} onPress={() => onChangeFilter('visited')} />
        <SegmentButton label="未訪問" active={filter === 'unvisited'} onPress={() => onChangeFilter('unvisited')} />
      </View>
      <View style={styles.countryList}>
        {countries.map((country) => {
          const visitCount = visitCountByCountry[country.id] ?? 0;
          const visited = visitCount > 0;
          return (
            <CountryRow
              key={country.id}
              country={country}
              meta={visited ? `訪問済み ${visitCount}回` : '未訪問'}
              selected={country.id === countryId}
              onPress={() => onSelectCountry(country.id)}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: spacing.md,
  },
  segment: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: 4,
    borderRadius: radius.round,
    backgroundColor: 'rgba(255, 250, 238, 0.8)',
    borderWidth: 1,
    borderColor: colors.border,
  },
  countryList: {
    gap: spacing.sm,
  },
});
