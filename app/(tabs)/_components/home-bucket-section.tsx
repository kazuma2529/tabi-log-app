import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BucketCountrySwipeRow, EmptyState, SectionTitle } from '@/components';
import { useConfirmBucketDelete } from '@/features';
import { colors, spacing } from '@/theme';
import type { Country } from '@/types';

type HomeBucketSectionProps = {
  bucketCountries: Country[];
};

const VISIBLE_BUCKET_LIMIT = 5;

export function HomeBucketSection({ bucketCountries }: HomeBucketSectionProps) {
  const router = useRouter();
  const confirmDeleteBucket = useConfirmBucketDelete();
  const visibleBucketCountries = bucketCountries.slice(0, VISIBLE_BUCKET_LIMIT);

  return (
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
                onOpenDetail={() =>
                  router.push({
                    pathname: '/bucket/[countryId]',
                    params: { countryId: country.id },
                  })
                }
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
  );
}

const styles = StyleSheet.create({
  sectionGap: {
    gap: spacing.md,
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
});
