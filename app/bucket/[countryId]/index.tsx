import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppScreen, BackIconButton, EmptyState, PaperCard } from '@/components';
import { COUNTRY_BY_ID } from '@/data';
import { getBucketMemosByCountry, isCountryInBucket } from '@/features';
import { useTravel } from '@/hooks';
import { colors, spacing } from '@/theme';

import { BucketMemoInput } from './_components/bucket-memo-input';
import { BucketMemoRow } from './_components/bucket-memo-row';

export default function BucketCountryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ countryId: string }>();
  const country = COUNTRY_BY_ID[params.countryId];
  const { data, addBucketMemo, removeBucketMemo, toggleBucketMemoDone, addBucketCountry } = useTravel();
  const memos = useMemo(() => getBucketMemosByCountry(data, params.countryId), [data, params.countryId]);
  const inBucket = isCountryInBucket(data, params.countryId);
  const [draft, setDraft] = useState('');

  if (!country) {
    return (
      <AppScreen>
        <View style={styles.topBar}>
          <BackIconButton onPress={() => router.back()} />
        </View>
        <EmptyState icon="🗺️" title="国が見つかりません" body="国マスタに存在しない国IDです。" />
      </AppScreen>
    );
  }

  async function handleAdd() {
    const trimmed = draft.trim();
    if (trimmed.length === 0) {
      return;
    }
    if (!inBucket) {
      await addBucketCountry(country.id);
    }
    await addBucketMemo(country.id, trimmed);
    setDraft('');
  }

  return (
    <AppScreen>
      <View style={styles.topBar}>
        <BackIconButton onPress={() => router.back()} />
      </View>

      <PaperCard style={styles.countryInfo}>
        <Text style={styles.heroFlag}>{country.flag}</Text>
        <Text selectable style={styles.countryName}>
          {country.nameJa}
        </Text>
        <Text selectable style={styles.countryMeta}>
          {country.region}・{country.nameEn}
        </Text>
      </PaperCard>

      <View style={styles.section}>
        <Text selectable style={styles.sectionTitle}>
          やりたいこと・行きたい場所
        </Text>
        <Text selectable style={styles.sectionHint}>
          この国で叶えたい体験を書き残しておきましょう。
        </Text>

        <BucketMemoInput value={draft} onChange={setDraft} onSubmit={handleAdd} />

        {memos.length > 0 ? (
          <View style={styles.memoList}>
            {memos.map((memo) => (
              <BucketMemoRow
                key={memo.id}
                memo={memo}
                onToggle={() => toggleBucketMemoDone(memo.id, !memo.isDone)}
                onRemove={() => removeBucketMemo(memo.id)}
              />
            ))}
          </View>
        ) : (
          <EmptyState
            icon="✨"
            title="まだ何も書かれていません"
            body="行ってみたい場所や、してみたいことを上の欄から追加できます。"
          />
        )}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    minHeight: 44,
  },
  countryInfo: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  heroFlag: {
    fontSize: 54,
  },
  countryName: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '900',
  },
  countryMeta: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  },
  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '900',
  },
  sectionHint: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  },
  memoList: {
    gap: spacing.sm,
  },
});
