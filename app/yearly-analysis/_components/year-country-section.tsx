import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PaperCard, SectionTitle } from '@/components';
import { type YearlyCountryVisitSummary } from '@/features';
import { formatDateSlash } from '@/lib';
import { colors, radius, spacing } from '@/theme';
import type { VisitBundle } from '@/types';

type YearCountrySectionProps = {
  title: string;
  emptyTitle: string;
  countries: YearlyCountryVisitSummary[];
  onOpenCountry: (item: YearlyCountryVisitSummary) => void;
};

export function YearCountrySection({ title, emptyTitle, countries, onOpenCountry }: YearCountrySectionProps) {
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
