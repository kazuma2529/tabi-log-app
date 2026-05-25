import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Alert, ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppScreen, BucketCountrySwipeRow, CountryPhotoCard, EmptyState, PaperCard, ProgressBar, SectionTitle } from '@/components';
import { getBucketCountries, getCountrySummaries, getLatestVisitedCountry, getMostVisitedCountry, getWorldProgress } from '@/features';
import { useTravel } from '@/hooks';
import { formatDateSlash } from '@/lib';
import { colors, spacing } from '@/theme';
import type { Country } from '@/types';

export default function HomeScreen() {
  const router = useRouter();
  const { data, isReady, error, removeBucketCountry } = useTravel();
  const progress = getWorldProgress(data);
  const recentCountries = getCountrySummaries(data);
  const mostVisited = getMostVisitedCountry(data);
  const latestVisited = getLatestVisitedCountry(data);
  const bucketCountries = getBucketCountries(data);
  const visibleBucketCountries = bucketCountries.slice(0, 5);
  const showMostVisited = mostVisited != null && mostVisited.visitCount >= 2;

  function confirmDeleteBucket(country: Country, close: () => void) {
    Alert.alert(
      `${country.nameJa}をリストから外しますか？`,
      'この国の「行ってみたいこと」も一緒に削除されます。',
      [
        { text: 'キャンセル', style: 'cancel', onPress: close },
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => {
            close();
            await removeBucketCountry(country.id);
          },
        },
      ],
    );
  }

  return (
    <AppScreen sky>
      <View style={styles.homeHeader}>
        <Text selectable style={styles.homeTitle}>
          ホーム
        </Text>
      </View>

      {!isReady ? <Text style={styles.statusText}>旅ノートを準備しています...</Text> : null}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <View style={styles.progressCard}>
        <ImageBackground source={require('../../assets/images/progress-treasure-map.png')} resizeMode="stretch" style={styles.progressMap} />
        <View style={styles.progressHeader}>
          <View style={styles.progressTextBlock}>
            <Text selectable style={styles.cardLabel}>
              世界制覇の進捗
            </Text>
            <Text selectable style={styles.bigNumber}>
              {progress.visited}
              <Text style={styles.totalText}> / {progress.total} か国</Text>
            </Text>
            <Text selectable style={styles.rateText}>
              世界制覇率 {progress.percentage}%
            </Text>
          </View>
        </View>
        <View style={styles.progressBarWrap}>
          <ProgressBar value={progress.percentage} color="#2D9A85" />
        </View>
      </View>

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
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
            {recentCountries.map((summary) => (
              <CountryPhotoCard
                key={summary.country.id}
                summary={summary}
                compact
                onPress={() => router.push({ pathname: '/country/[countryId]', params: { countryId: summary.country.id } })}
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

      <View style={styles.sectionGap}>
        <SectionTitle
          title="行ってみたい国"
          action={
            <Pressable onPress={() => router.push('/bucket-list')}>
              <Text style={styles.smallLink}>すべて見る ›</Text>
            </Pressable>
          }
        />
        {visibleBucketCountries.length > 0 ? (
          <>
            <View style={styles.bucketList}>
              {visibleBucketCountries.map((country) => (
                <BucketCountrySwipeRow
                  key={country.id}
                  country={country}
                  onOpenDetail={() => router.push({ pathname: '/bucket/[countryId]', params: { countryId: country.id } })}
                  onConfirmDelete={(close) => confirmDeleteBucket(country, close)}
                />
              ))}
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="行きたい国を追加"
              style={({ pressed }) => [styles.bucketAddMore, pressed && styles.pressed]}
              onPress={() => router.push('/bucket-list/add')}
            >
              <Ionicons name="add" size={16} color={colors.textSecondary} />
              <Text style={styles.bucketAddMoreText}>行きたい国を追加</Text>
            </Pressable>
          </>
        ) : (
          <EmptyState
            icon="⭐"
            title="行きたい国を追加しましょう"
            body="タップして、これから行きたい国を登録できます。"
            onPress={() => router.push('/bucket-list/add')}
          />
        )}
      </View>

      <PaperCard inset style={styles.statsCard}>
        <Text selectable style={styles.statsTitle}>
          簡単な統計
        </Text>
        {showMostVisited ? (
          <StatLine
            icon={mostVisited.country.flag}
            label="最も訪問回数が多い国"
            value={`${mostVisited.country.nameJa}（${mostVisited.visitCount}回）`}
          />
        ) : null}
        <StatLine
          icon={latestVisited?.country.flag ?? '✈️'}
          label="最後に訪問した国"
          value={latestVisited ? `${latestVisited.country.nameJa}  ${formatDateSlash(latestVisited.lastVisitedAt)}` : 'まだありません'}
        />
      </PaperCard>
    </AppScreen>
  );
}

function StatLine({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.statLine}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text selectable style={styles.statLabel}>
        {label}
      </Text>
      <Text selectable style={styles.statValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
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
  progressCard: {
    position: 'relative',
    minHeight: 158,
    gap: 10,
    marginTop: 2,
    marginHorizontal: -2,
    paddingTop: 32,
    paddingRight: 112,
    paddingBottom: 26,
    paddingLeft: 32,
    backgroundColor: 'transparent',
  },
  progressMap: {
    position: 'absolute',
    inset: 0,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressTextBlock: {
    flex: 1,
    gap: 6,
  },
  cardLabel: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  bigNumber: {
    color: colors.textPrimary,
    fontSize: 48,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  totalText: {
    fontSize: 18,
    fontWeight: '800',
  },
  rateText: {
    color: colors.accentTeal,
    fontSize: 18,
    fontWeight: '900',
  },
  progressBarWrap: {
    maxWidth: 214,
    marginTop: 4,
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
  bucketList: {
    gap: spacing.sm,
  },
  bucketAddMore: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: -spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  bucketAddMoreText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.82,
  },
  statsCard: {
    gap: spacing.sm,
    backgroundColor: 'rgba(255, 248, 232, 0.93)',
  },
  statsTitle: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '900',
  },
  statLine: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(109, 90, 66, 0.14)',
  },
  statIcon: {
    width: 28,
    fontSize: 21,
    lineHeight: 28,
  },
  statLabel: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  statValue: {
    maxWidth: 132,
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'right',
  },
});
