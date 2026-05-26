import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { PaperCard } from '@/components';
import { formatDateSlash } from '@/lib';
import { colors, radius, shadows, spacing, text } from '@/theme';
import type { Country, CountrySummary, VisitBundle } from '@/types';

type CountryHeroProps = {
  country: Country;
  summary: CountrySummary;
  selectedVisitId: string;
  onSelectVisit: (visitId: string) => void;
  onAddVisit: () => void;
};

export function CountryHero({ country, summary, selectedVisitId, onSelectVisit, onAddVisit }: CountryHeroProps) {
  return (
    <PaperCard inset style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.heroFlag}>{country.flag}</Text>
        <View style={styles.headerText}>
          <Text selectable style={styles.name}>
            {country.nameJa}
          </Text>
          <Text selectable style={styles.meta}>
            訪問回数 {summary.visitCount}回・最終訪問日 {formatDateSlash(summary.lastVisitedAt)}
          </Text>
        </View>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabs}
        style={styles.tabsScroll}
      >
        {summary.visits.map((bundle: VisitBundle, index: number) => {
          const active = bundle.visit.id === selectedVisitId;
          return (
            <Pressable
              key={bundle.visit.id}
              accessibilityRole="button"
              accessibilityLabel={`${index + 1}回目 ${formatDateSlash(bundle.visit.visitedAt)}`}
              accessibilityState={{ selected: active }}
              style={[styles.tab, active && styles.tabActive]}
              onPress={() => onSelectVisit(bundle.visit.id)}
            >
              <Text selectable style={[styles.tabText, active && styles.tabTextActive]}>
                {index + 1}回目
              </Text>
              <Text selectable style={[styles.tabSubText, active && styles.tabSubTextActive]}>
                {formatDateSlash(bundle.visit.visitedAt)}
              </Text>
            </Pressable>
          );
        })}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="この国に新しい訪問を追加"
          style={styles.addPill}
          onPress={onAddVisit}
        >
          <Ionicons name="add" size={16} color={colors.accentTealDark} />
          <Text selectable style={styles.addText}>
            訪問を追加
          </Text>
        </Pressable>
      </ScrollView>
    </PaperCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  heroFlag: {
    fontSize: 54,
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  name: text.countryName,
  meta: text.countryMeta,
  tabsScroll: {
    marginHorizontal: -spacing.lg,
  },
  tabs: {
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  tab: {
    minWidth: 92,
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    gap: 2,
    borderRadius: radius.lg,
    borderColor: colors.border,
    borderWidth: 1,
    backgroundColor: colors.paper,
    boxShadow: shadows.soft,
  },
  tabActive: {
    backgroundColor: colors.accentTealDark,
    borderColor: colors.accentTealDark,
  },
  tabText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '900',
  },
  tabTextActive: {
    color: colors.white,
  },
  tabSubText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  tabSubTextActive: {
    color: 'rgba(255, 255, 255, 0.86)',
  },
  addPill: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.accentTealDark,
    backgroundColor: 'rgba(47, 155, 145, 0.08)',
  },
  addText: {
    color: colors.accentTealDark,
    fontSize: 13,
    fontWeight: '800',
  },
});
