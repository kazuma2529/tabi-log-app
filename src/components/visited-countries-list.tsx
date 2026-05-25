import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { getDiarySections } from '@/features';
import { useTravel } from '@/hooks';
import { formatDateSlash } from '@/lib';
import { colors, spacing } from '@/theme';

import { CountryRow } from './country-row';
import { EmptyState } from './empty-state';
import { PaperCard } from './paper-card';

export function VisitedCountriesList() {
  const router = useRouter();
  const { data } = useTravel();
  const sections = getDiarySections(data);

  if (sections.length === 0) {
    return <EmptyState icon="📖" title="記録はまだ空です" body="訪問記録を追加すると、国が地域別にここへ並びます。" />;
  }

  return (
    <>
      {sections.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text selectable style={styles.sectionTitle}>
            {section.title}
          </Text>
          <PaperCard inset style={styles.listCard}>
            {section.data.map((summary, index) => (
              <View key={summary.country.id} style={styles.rowWrap}>
                <CountryRow
                  country={summary.country}
                  trailing={formatDateSlash(summary.lastVisitedAt)}
                  variant="list"
                  onPress={() => router.push({ pathname: '/country/[countryId]', params: { countryId: summary.country.id } })}
                />
                {index < section.data.length - 1 ? <View style={styles.divider} /> : null}
              </View>
            ))}
          </PaperCard>
        </View>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '900',
  },
  listCard: {
    gap: 0,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: 'rgba(255, 248, 232, 0.94)',
  },
  rowWrap: {
    gap: 0,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(166, 108, 32, 0.18)',
    marginLeft: 46,
  },
});
