import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppScreen, BackIconButton, BucketCountrySwipeRow, EmptyState } from '@/components';
import { getBucketCountries, useConfirmBucketDelete } from '@/features';
import { useTravel } from '@/hooks';
import { colors, spacing } from '@/theme';

export default function BucketListScreen() {
  const router = useRouter();
  const { data } = useTravel();
  const bucketCountries = getBucketCountries(data);
  const confirmDelete = useConfirmBucketDelete();

  return (
    <AppScreen
      title="行ってみたい国"
      headerAlign="center"
      left={<BackIconButton onPress={() => router.back()} />}
    >
      {bucketCountries.length > 0 ? (
        <>
          <View style={styles.list}>
            {bucketCountries.map((country) => (
              <BucketCountrySwipeRow
                key={country.id}
                country={country}
                onOpenDetail={() => router.push({ pathname: '/bucket/[countryId]', params: { countryId: country.id } })}
                onConfirmDelete={(close) => confirmDelete(country, close)}
              />
            ))}
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="行きたい国を追加"
            style={({ pressed }) => [styles.addMore, pressed && styles.pressed]}
            onPress={() => router.push('/bucket-list/add')}
          >
            <Ionicons name="add" size={16} color={colors.textSecondary} />
            <Text style={styles.addMoreText}>行きたい国を追加</Text>
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
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
  },
  addMore: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  addMoreText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.82,
  },
});
