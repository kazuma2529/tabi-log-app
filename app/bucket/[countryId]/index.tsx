import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppScreen, EmptyState, PaperCard } from '@/components';
import { COUNTRY_BY_ID } from '@/data';
import { getBucketMemosByCountry, isCountryInBucket } from '@/features';
import { useTravel } from '@/hooks';
import { colors, radius, shadows, spacing } from '@/theme';
import type { BucketMemo } from '@/types';

export default function BucketCountryScreen() {
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
          <BackButton />
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
        <BackButton />
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

        <PaperCard inset style={styles.addCard}>
          <View style={styles.addInputRow}>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder="例：エッフェル塔に登る"
              placeholderTextColor={colors.textMuted}
              style={styles.addInput}
              returnKeyType="done"
              onSubmitEditing={handleAdd}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="追加"
              onPress={handleAdd}
              disabled={draft.trim().length === 0}
              style={({ pressed }) => [
                styles.addButton,
                draft.trim().length === 0 && styles.addButtonDisabled,
                pressed && draft.trim().length > 0 && styles.addButtonPressed,
              ]}
            >
              <Ionicons name="add" size={24} color={colors.white} />
            </Pressable>
          </View>
        </PaperCard>

        {memos.length > 0 ? (
          <View style={styles.memoList}>
            {memos.map((memo) => (
              <MemoRow
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

type MemoRowProps = {
  memo: BucketMemo;
  onToggle: () => void;
  onRemove: () => void;
};

function MemoRow({ memo, onToggle, onRemove }: MemoRowProps) {
  return (
    <View style={styles.memoRow}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: memo.isDone }}
        accessibilityLabel={memo.isDone ? '達成を取り消す' : '達成にする'}
        onPress={onToggle}
        style={({ pressed }) => [styles.checkbox, memo.isDone && styles.checkboxChecked, pressed && styles.pressed]}
      >
        {memo.isDone ? <Ionicons name="checkmark" size={16} color={colors.white} /> : null}
      </Pressable>
      <Text selectable style={[styles.memoText, memo.isDone && styles.memoTextDone]} numberOfLines={2}>
        {memo.content}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="削除"
        onPress={onRemove}
        style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]}
      >
        <Ionicons name="close" size={18} color={colors.textSecondary} />
      </Pressable>
    </View>
  );
}

function BackButton() {
  const router = useRouter();

  return (
    <Pressable accessibilityRole="button" accessibilityLabel="戻る" style={styles.backButton} onPress={() => router.back()}>
      <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    minHeight: 44,
  },
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
  addCard: {
    paddingVertical: spacing.md,
  },
  addInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  addInput: {
    flex: 1,
    minHeight: 44,
    color: colors.textPrimary,
    fontSize: 15,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.paper,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
  },
  addButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.round,
    backgroundColor: colors.accentTeal,
    boxShadow: shadows.button,
  },
  addButtonDisabled: {
    opacity: 0.45,
  },
  addButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.96 }],
  },
  memoList: {
    gap: spacing.sm,
  },
  memoRow: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.paper,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    boxShadow: shadows.soft,
  },
  checkbox: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.accentTealDark,
    backgroundColor: colors.paper,
  },
  checkboxChecked: {
    backgroundColor: colors.accentTeal,
    borderColor: colors.accentTealDark,
  },
  memoText: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 21,
  },
  memoTextDone: {
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
  deleteButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.round,
    backgroundColor: colors.backgroundSoft,
    borderColor: colors.border,
    borderWidth: 1,
  },
  pressed: {
    opacity: 0.7,
  },
});
