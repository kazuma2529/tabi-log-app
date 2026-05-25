import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppScreen, BucketCountrySwipeRow, EmptyState } from '@/components';
import { getBucketCountries } from '@/features';
import { useTravel } from '@/hooks';
import { colors, spacing } from '@/theme';
import type { Country } from '@/types';

export default function BucketListScreen() {
  const router = useRouter();
  const { data, removeBucketCountry } = useTravel();
  const bucketCountries = getBucketCountries(data);

  function confirmDelete(country: Country, close: () => void) {
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
    <AppScreen
      title="行ってみたい国"
      headerAlign="center"
      left={
        <Pressable accessibilityRole="button" accessibilityLabel="戻る" style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </Pressable>
      }
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
  backButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 21,
    backgroundColor: colors.paper,
    borderColor: colors.border,
    borderWidth: 1,
  },
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
