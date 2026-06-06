import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { PaperCard } from '@/components';
import { type YearlyTravelSummary } from '@/features';
import { colors, radius, spacing } from '@/theme';

type YearlyAnalysisHeroProps = {
  summary: YearlyTravelSummary | null;
};

export function YearlyAnalysisHero({ summary }: YearlyAnalysisHeroProps) {
  return (
    <PaperCard style={styles.card}>
      <View pointerEvents="none" style={styles.decoration} />

      <View style={styles.header}>
        <View style={styles.medallion}>
          <Ionicons name="book-outline" size={24} color="#FFF8E8" />
        </View>
        <View style={styles.headerText}>
          <Text selectable style={styles.eyebrow}>
            PREMIUM YEARBOOK
          </Text>
          <Text selectable style={styles.title}>
            旅の歩みを、一年ずつ。
          </Text>
        </View>
        <View style={styles.premiumBadge}>
          <Ionicons name="sparkles" size={12} color={colors.accentGold} />
          <Text selectable style={styles.premiumBadgeText}>
            PREMIUM
          </Text>
        </View>
      </View>

      {summary ? (
        <View style={styles.summary}>
          <View style={styles.yearBlock}>
            <Text selectable style={styles.year}>
              {summary.year}
            </Text>
            <Text selectable style={styles.yearSuffix}>
              年
            </Text>
          </View>
          <Text selectable style={styles.description}>
            {summary.countryCount}か国を訪れ、新しく{summary.newCountryCount}か国との出会いが増えました。
          </Text>
        </View>
      ) : (
        <Text selectable style={styles.emptyDescription}>
          訪問記録を追加すると、年ごとの訪問国、新しい国との出会い、旅の推移をここで振り返れます。
        </Text>
      )}
    </PaperCard>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'relative',
    overflow: 'hidden',
    gap: spacing.lg,
    backgroundColor: 'rgba(255, 246, 226, 0.97)',
    borderColor: '#CF9E48',
    borderWidth: 1.5,
    boxShadow: '0 8px 24px rgba(112, 72, 20, 0.18)',
  },
  decoration: {
    position: 'absolute',
    top: -72,
    right: -56,
    width: 170,
    height: 170,
    borderRadius: radius.round,
    backgroundColor: 'rgba(233, 187, 99, 0.16)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  medallion: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.round,
    borderColor: '#E1BA6A',
    borderWidth: 2,
    backgroundColor: colors.accentGold,
    boxShadow: '0 4px 12px rgba(132, 82, 19, 0.22)',
  },
  headerText: {
    flex: 1,
    gap: 3,
  },
  eyebrow: {
    color: colors.accentGold,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.7,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '900',
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: radius.round,
    borderColor: '#D9B66E',
    borderWidth: 1,
    backgroundColor: 'rgba(255, 250, 238, 0.78)',
  },
  premiumBadgeText: {
    color: colors.accentGold,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  summary: {
    gap: spacing.sm,
  },
  yearBlock: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
  },
  year: {
    color: colors.textPrimary,
    fontSize: 42,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
    letterSpacing: 1,
  },
  yearSuffix: {
    color: colors.accentGold,
    fontSize: 16,
    fontWeight: '900',
  },
  description: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 20,
  },
  emptyDescription: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 21,
  },
});
