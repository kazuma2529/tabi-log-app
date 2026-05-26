import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

import { formatDateSlash } from '@/lib';
import { colors, radius, shadows, spacing } from '@/theme';
import type { CountrySummary } from '@/types';

type CountryPhotoCardProps = Omit<PressableProps, 'style'> & {
  summary: CountrySummary;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function CountryPhotoCard({ summary, compact = false, style, ...props }: CountryPhotoCardProps) {
  const latestVisit = summary.visits[summary.visits.length - 1];
  // 最新訪問に写真がなければ、新しい順に遡って「写真がある訪問」の 1 枚目を採用する。
  // どの訪問にも写真が無い場合は undefined のままで、呼び出し側で国旗フォールバックさせる。
  const photo = [...summary.visits].reverse().flatMap((bundle) => bundle.photos)[0];
  const cityText = latestVisit?.cities.map((city) => city.name).join('、');

  return (
    <Pressable style={({ pressed }) => [styles.card, compact && styles.compact, pressed && styles.pressed, style]} {...props}>
      <View style={[styles.imagePlaceholder, { backgroundColor: summary.country.accent }]}>
        {photo ? <Image source={{ uri: photo.uri }} style={StyleSheet.absoluteFill} contentFit="cover" /> : null}
        {!photo ? <Text style={styles.emptyFlag}>{summary.country.flag}</Text> : null}
      </View>
      <View style={styles.body}>
        {photo ? (
          <View style={styles.flagBadge}>
            <Text style={styles.flagBadgeText}>{summary.country.flag}</Text>
          </View>
        ) : null}
        <Text selectable style={styles.name} numberOfLines={1}>
          {summary.country.nameJa}
        </Text>
        {/* 都市が未登録のときは無理に日付を表示せず、空白行で高さだけ保つ。 */}
        <Text selectable style={styles.meta} numberOfLines={1}>
          {cityText || '\u00A0'}
        </Text>
        <Text selectable style={styles.date}>
          {formatDateSlash(summary.lastVisitedAt)}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 126,
    overflow: 'hidden',
    borderRadius: radius.md,
    backgroundColor: colors.paper,
    borderColor: colors.border,
    borderWidth: 1,
    boxShadow: shadows.soft,
  },
  compact: {
    width: 106,
  },
  pressed: {
    opacity: 0.84,
  },
  imagePlaceholder: {
    height: 94,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyFlag: {
    fontSize: 36,
    textShadowColor: 'rgba(0, 0, 0, 0.22)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
  body: {
    position: 'relative',
    padding: spacing.sm,
    paddingTop: spacing.md,
    gap: 2,
  },
  flagBadge: {
    position: 'absolute',
    top: -16,
    left: 4,
    height: 30,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  flagBadgeText: {
    fontSize: 26,
    lineHeight: 30,
    textShadowColor: 'rgba(0, 0, 0, 0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  name: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '800',
  },
  meta: {
    color: colors.textSecondary,
    fontSize: 11,
  },
  date: {
    color: colors.textMuted,
    fontSize: 11,
  },
});
