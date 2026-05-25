import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppScreen, EmptyState, PaperCard, PrimaryButton, useUndoToast } from '@/components';
import { FREE_PHOTO_LIMIT } from '@/constants';
import { COUNTRY_BY_ID, MEMO_CARD_DEFINITIONS, getMemoDefinition } from '@/data';
import { getCountrySummary, isCountryInBucket } from '@/features';
import { useTravel } from '@/hooks';
import { formatDateSlash, fromISODate, pickAndStoreVisitPhotos, toISODate } from '@/lib';
import { colors, radius, shadows, spacing } from '@/theme';
import type { City, MemoCard, MemoType, Photo } from '@/types';

export default function CountryDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ countryId: string }>();
  const {
    data,
    addBucketCountry,
    removeVisit,
    updateVisitDate,
    addCity,
    removeCity,
    restoreCity,
    addPhotosToVisit,
    removePhoto,
    restorePhoto,
    purgePhotoFile,
    addMemo,
    updateMemoContent,
    removeMemo,
    restoreMemo,
  } = useTravel();
  const { showUndoToast } = useUndoToast();
  const country = COUNTRY_BY_ID[params.countryId];
  const summary = getCountrySummary(data, params.countryId);
  const isPremium = data.purchase.isPremium;

  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(summary?.visits[0]?.visit.id ?? null);
  const [isDatePickerOpen, setDatePickerOpen] = useState(false);
  const [cityDraft, setCityDraft] = useState('');
  const [isCityInputOpen, setCityInputOpen] = useState(false);
  const [editingMemoId, setEditingMemoId] = useState<string | null>(null);
  const [memoDraft, setMemoDraft] = useState('');
  const [isMemoPickerOpen, setMemoPickerOpen] = useState(false);

  useEffect(() => {
    if (!selectedVisitId && summary?.visits[0]) {
      setSelectedVisitId(summary.visits[0].visit.id);
    }
  }, [selectedVisitId, summary]);

  const selectedVisit = useMemo(() => {
    return summary?.visits.find((bundle) => bundle.visit.id === selectedVisitId) ?? summary?.visits[0];
  }, [selectedVisitId, summary]);

  // 訪問が切り替わったらインライン編集状態をリセット
  useEffect(() => {
    setDatePickerOpen(false);
    setCityDraft('');
    setCityInputOpen(false);
    setEditingMemoId(null);
    setMemoDraft('');
  }, [selectedVisit?.visit.id]);

  const confirmDeleteVisit = useCallback(() => {
    if (!selectedVisit) return;
    const visitId = selectedVisit.visit.id;
    Alert.alert(
      'この訪問記録を削除しますか？',
      '写真とメモも一緒に削除されます。元には戻せません。',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => {
            try {
              const remaining = summary?.visits.filter((bundle) => bundle.visit.id !== visitId) ?? [];
              await removeVisit(visitId);
              if (remaining.length > 0) {
                setSelectedVisitId(remaining[0].visit.id);
              } else {
                router.back();
              }
            } catch (caught) {
              Alert.alert('削除できませんでした', caught instanceof Error ? caught.message : 'もう一度お試しください。');
            }
          },
        },
      ],
    );
  }, [removeVisit, router, selectedVisit, summary]);

  const handleDateChange = useCallback(
    async (_event: DateTimePickerEvent, next?: Date) => {
      if (!selectedVisit || !next) return;
      const iso = toISODate(next);
      if (iso === selectedVisit.visit.visitedAt) {
        setDatePickerOpen(false);
        return;
      }
      try {
        await updateVisitDate(selectedVisit.visit.id, iso);
        setDatePickerOpen(false);
      } catch (caught) {
        Alert.alert('日付を更新できませんでした', caught instanceof Error ? caught.message : 'もう一度お試しください。');
      }
    },
    [selectedVisit, updateVisitDate],
  );

  const handleAddCity = useCallback(async () => {
    if (!selectedVisit) return;
    const trimmed = cityDraft.trim();
    if (!trimmed) {
      setCityInputOpen(false);
      return;
    }
    try {
      await addCity(selectedVisit.visit.id, trimmed);
      setCityDraft('');
      setCityInputOpen(false);
    } catch (caught) {
      Alert.alert('都市を追加できませんでした', caught instanceof Error ? caught.message : 'もう一度お試しください。');
    }
  }, [addCity, cityDraft, selectedVisit]);

  const handleRemoveCity = useCallback(
    async (city: City) => {
      try {
        const removed = await removeCity(city.id);
        if (!removed) return;
        showUndoToast({
          label: `「${removed.name}」を削除しました`,
          onUndo: async () => {
            try {
              await restoreCity(removed);
            } catch {
              // 復元失敗時は黙る
            }
          },
        });
      } catch (caught) {
        Alert.alert('都市を削除できませんでした', caught instanceof Error ? caught.message : 'もう一度お試しください。');
      }
    },
    [removeCity, restoreCity, showUndoToast],
  );

  const handlePickPhotos = useCallback(async () => {
    if (!selectedVisit) return;
    try {
      const current = selectedVisit.photos.length;
      const result = await pickAndStoreVisitPhotos(current, isPremium);
      if (result.limitReached) {
        Alert.alert('写真の上限です', `無料版では1訪問あたり${FREE_PHOTO_LIMIT}枚まで追加できます。`);
        return;
      }
      if (result.uris.length === 0) return;
      await addPhotosToVisit(selectedVisit.visit.id, result.uris);
    } catch (caught) {
      Alert.alert('写真を追加できませんでした', caught instanceof Error ? caught.message : 'もう一度お試しください。');
    }
  }, [addPhotosToVisit, isPremium, selectedVisit]);

  const handleRemovePhoto = useCallback(
    async (photo: Photo) => {
      try {
        const removed = await removePhoto(photo.id);
        if (!removed) return;
        showUndoToast({
          label: '写真を削除しました',
          onUndo: async () => {
            try {
              await restorePhoto(removed);
            } catch {
              // 復元失敗時は黙る
            }
          },
          onExpire: async () => {
            try {
              await purgePhotoFile(removed.uri);
            } catch {
              // ファイル削除失敗は黙る
            }
          },
        });
      } catch (caught) {
        Alert.alert('写真を削除できませんでした', caught instanceof Error ? caught.message : 'もう一度お試しください。');
      }
    },
    [purgePhotoFile, removePhoto, restorePhoto, showUndoToast],
  );

  const handleAddMemo = useCallback(
    async (type: MemoType) => {
      if (!selectedVisit) return;
      try {
        const created = await addMemo(selectedVisit.visit.id, type, '');
        setMemoPickerOpen(false);
        setEditingMemoId(created.id);
        setMemoDraft('');
      } catch (caught) {
        Alert.alert('メモを追加できませんでした', caught instanceof Error ? caught.message : 'もう一度お試しください。');
      }
    },
    [addMemo, selectedVisit],
  );

  const beginEditMemo = useCallback((memo: MemoCard) => {
    setEditingMemoId(memo.id);
    setMemoDraft(memo.content);
  }, []);

  const handleSaveMemo = useCallback(
    async (memo: MemoCard) => {
      const next = memoDraft;
      setEditingMemoId(null);
      if (next === memo.content) return;
      try {
        await updateMemoContent(memo.id, next);
      } catch (caught) {
        Alert.alert('メモを保存できませんでした', caught instanceof Error ? caught.message : 'もう一度お試しください。');
      }
    },
    [memoDraft, updateMemoContent],
  );

  const handleRemoveMemo = useCallback(
    async (memo: MemoCard) => {
      try {
        const removed = await removeMemo(memo.id);
        if (!removed) return;
        const definition = getMemoDefinition(removed.type);
        showUndoToast({
          label: `「${definition?.title ?? 'メモ'}」を削除しました`,
          onUndo: async () => {
            try {
              await restoreMemo(removed);
            } catch {
              // 復元失敗時は黙る
            }
          },
        });
      } catch (caught) {
        Alert.alert('メモを削除できませんでした', caught instanceof Error ? caught.message : 'もう一度お試しください。');
      }
    },
    [removeMemo, restoreMemo, showUndoToast],
  );

  if (!country) {
    return (
      <AppScreen>
        <TopBar />
        <EmptyState icon="🗺️" title="国が見つかりません" body="国マスタに存在しない国IDです。" />
      </AppScreen>
    );
  }

  const availableMemoTypes = selectedVisit
    ? MEMO_CARD_DEFINITIONS.filter((def) => !selectedVisit.memos.some((memo) => memo.type === def.type))
    : MEMO_CARD_DEFINITIONS;

  return (
    <AppScreen>
      <TopBar />
      {!summary ? (
        <View style={styles.emptyBlock}>
          <PaperCard style={styles.countryInfo}>
            <Text style={styles.heroFlag}>{country.flag}</Text>
            <Text selectable style={styles.countryName}>
              {country.nameJa}
            </Text>
            <Text selectable style={styles.countryMeta}>
              {country.region}・{country.nameEn}
            </Text>
          </PaperCard>
          <EmptyState icon="✈️" title="まだ訪問記録がありません" body="この国の訪問日、都市、写真、メモを追加できます。" />
          <PrimaryButton label="訪問記録を追加" onPress={() => router.push({ pathname: '/add', params: { countryId: country.id } })} />
          <PrimaryButton
            label={isCountryInBucket(data, country.id) ? 'バケットリスト追加済み' : '行きたい国に追加'}
            variant="secondary"
            onPress={() => addBucketCountry(country.id)}
          />
        </View>
      ) : null}

      {summary && selectedVisit ? (
        <>
          <PaperCard style={styles.summaryCard}>
            <Text style={styles.heroFlag}>{country.flag}</Text>
            <View style={styles.summaryText}>
              <Text selectable style={styles.countryName}>
                {country.nameJa}
              </Text>
              <Text selectable style={styles.countryMeta}>
                訪問回数 {summary.visitCount}回・最後に行った日 {formatDateSlash(summary.lastVisitedAt)}
              </Text>
            </View>
          </PaperCard>

          <View style={styles.visitTabsRow}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.visitTabs} style={styles.visitTabsScroll}>
              {summary.visits.map((bundle, index) => {
                const active = bundle.visit.id === selectedVisit.visit.id;
                return (
                  <Pressable
                    key={bundle.visit.id}
                    style={[styles.visitTab, active && styles.visitTabActive]}
                    onPress={() => setSelectedVisitId(bundle.visit.id)}
                  >
                    <Text selectable style={[styles.visitTabText, active && styles.visitTabTextActive]}>
                      {index + 1}回目
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="この訪問記録を削除"
              style={styles.trashButton}
              onPress={confirmDeleteVisit}
            >
              <Ionicons name="trash-outline" size={20} color={colors.textPrimary} />
            </Pressable>
          </View>

          <PaperCard inset style={styles.visitInfoCard}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`訪問日 ${formatDateSlash(selectedVisit.visit.visitedAt)}  タップで編集`}
              style={styles.infoLine}
              onPress={() => setDatePickerOpen((prev) => !prev)}
            >
              <Ionicons name="calendar-outline" size={18} color={colors.accentTealDark} />
              <Text selectable style={styles.infoLabel}>
                訪問日
              </Text>
              <Text selectable style={styles.infoValue}>
                {formatDateSlash(selectedVisit.visit.visitedAt)}
              </Text>
              <Ionicons
                name={isDatePickerOpen ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={colors.textMuted}
              />
            </Pressable>
            {isDatePickerOpen ? (
              <View style={styles.datePickerWrap}>
                <DateTimePicker
                  value={fromISODate(selectedVisit.visit.visitedAt)}
                  mode="date"
                  display="inline"
                  locale="ja-JP"
                  maximumDate={new Date()}
                  onChange={handleDateChange}
                  themeVariant="light"
                  accentColor={colors.accentTealDark}
                />
              </View>
            ) : null}

            <View style={styles.cityBlock}>
              <View style={styles.infoLine}>
                <Ionicons name="location-outline" size={18} color={colors.accentTealDark} />
                <Text selectable style={styles.infoLabel}>
                  訪問都市
                </Text>
                <View style={styles.flexFiller} />
              </View>
              <View style={styles.chipWrap}>
                {selectedVisit.cities.map((city) => (
                  <View key={city.id} style={styles.chipWithDelete}>
                    <Text selectable style={styles.chipText}>
                      {city.name}
                    </Text>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`${city.name} を削除`}
                      style={styles.chipDelete}
                      hitSlop={6}
                      onPress={() => handleRemoveCity(city)}
                    >
                      <Ionicons name="close" size={12} color={colors.textPrimary} />
                    </Pressable>
                  </View>
                ))}
                {isCityInputOpen ? (
                  <View style={styles.cityInputRow}>
                    <TextInput
                      value={cityDraft}
                      onChangeText={setCityDraft}
                      autoFocus
                      placeholder="例: バンコク"
                      style={styles.cityInput}
                      returnKeyType="done"
                      onSubmitEditing={handleAddCity}
                      onBlur={handleAddCity}
                    />
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="都市を追加"
                      style={styles.cityCommit}
                      onPress={handleAddCity}
                    >
                      <Ionicons name="checkmark" size={16} color={colors.white} />
                    </Pressable>
                  </View>
                ) : (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="都市を追加"
                    style={styles.addCityPill}
                    onPress={() => {
                      setCityDraft('');
                      setCityInputOpen(true);
                    }}
                  >
                    <Ionicons name="add" size={14} color={colors.accentTealDark} />
                    <Text selectable style={styles.addCityText}>
                      都市を追加
                    </Text>
                  </Pressable>
                )}
              </View>
            </View>
          </PaperCard>

          <View style={styles.section}>
            <Text selectable style={styles.sectionTitle}>
              写真
            </Text>
            <View style={styles.photoGrid}>
              {selectedVisit.photos.map((photo) => (
                <View key={photo.id} style={styles.photoTile}>
                  <Image source={{ uri: photo.uri }} style={StyleSheet.absoluteFill} contentFit="cover" />
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="写真を削除"
                    style={styles.photoDelete}
                    hitSlop={6}
                    onPress={() => handleRemovePhoto(photo)}
                  >
                    <Ionicons name="close" size={14} color={colors.textPrimary} />
                  </Pressable>
                </View>
              ))}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="写真を追加"
                style={styles.addPhotoTile}
                onPress={handlePickPhotos}
              >
                <Ionicons name="add" size={28} color={colors.accentTealDark} />
                <Text selectable style={styles.addPhotoLabel}>
                  写真を追加
                </Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.section}>
            <Text selectable style={styles.sectionTitle}>
              メモカード
            </Text>
            <View style={styles.memoList}>
              {selectedVisit.memos.map((memo) => {
                const definition = getMemoDefinition(memo.type);
                const isEditing = editingMemoId === memo.id;
                return (
                  <PaperCard key={memo.id} inset style={styles.memoCard}>
                    <View style={styles.memoHeader}>
                      <Text selectable style={styles.memoTitle}>
                        {definition?.icon ?? '📝'} {definition?.title ?? memo.type}
                      </Text>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`${definition?.title ?? 'メモ'} を削除`}
                        style={styles.memoDelete}
                        hitSlop={6}
                        onPress={() => handleRemoveMemo(memo)}
                      >
                        <Ionicons name="close" size={14} color={colors.textPrimary} />
                      </Pressable>
                    </View>
                    {isEditing ? (
                      <TextInput
                        value={memoDraft}
                        onChangeText={setMemoDraft}
                        autoFocus
                        multiline
                        maxLength={300}
                        placeholder={definition?.placeholder ?? 'メモを入力'}
                        style={styles.memoInput}
                        textAlignVertical="top"
                        onBlur={() => handleSaveMemo(memo)}
                      />
                    ) : (
                      <Pressable accessibilityRole="button" accessibilityLabel="メモを編集" onPress={() => beginEditMemo(memo)}>
                        <Text selectable style={memo.content ? styles.memoContent : styles.memoEmpty}>
                          {memo.content || 'タップして入力'}
                        </Text>
                      </Pressable>
                    )}
                  </PaperCard>
                );
              })}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="メモを追加"
                style={[styles.addMemoButton, availableMemoTypes.length === 0 && styles.addMemoButtonDisabled]}
                disabled={availableMemoTypes.length === 0}
                onPress={() => setMemoPickerOpen(true)}
              >
                <Ionicons name="add" size={18} color={colors.accentTealDark} />
                <Text selectable style={styles.addMemoText}>
                  {availableMemoTypes.length === 0 ? '追加できるメモがありません' : 'メモを追加'}
                </Text>
              </Pressable>
            </View>
          </View>

          <PrimaryButton label="この国に新しい訪問を追加" onPress={() => router.push({ pathname: '/add', params: { countryId: country.id } })} />

          <Modal visible={isMemoPickerOpen} animationType="slide" transparent onRequestClose={() => setMemoPickerOpen(false)}>
            <Pressable style={styles.modalBackdrop} onPress={() => setMemoPickerOpen(false)}>
              <Pressable style={styles.modalSheet} onPress={() => {}}>
                <View style={styles.modalHandle} />
                <Text selectable style={styles.modalTitle}>
                  追加するメモを選ぶ
                </Text>
                {availableMemoTypes.length === 0 ? (
                  <Text selectable style={styles.modalEmpty}>
                    すべてのメモカードを追加済みです。
                  </Text>
                ) : (
                  <View style={styles.memoTypeGrid}>
                    {availableMemoTypes.map((def) => (
                      <Pressable
                        key={def.type}
                        style={styles.memoTypeTile}
                        onPress={() => handleAddMemo(def.type)}
                      >
                        <Text style={styles.memoTypeIcon}>{def.icon}</Text>
                        <Text selectable style={styles.memoTypeText}>
                          {def.title}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                )}
                <Pressable
                  accessibilityRole="button"
                  style={styles.modalCancel}
                  onPress={() => setMemoPickerOpen(false)}
                >
                  <Text style={styles.modalCancelText}>キャンセル</Text>
                </Pressable>
              </Pressable>
            </Pressable>
          </Modal>
        </>
      ) : null}
    </AppScreen>
  );
}

function TopBar() {
  const router = useRouter();

  return (
    <View style={styles.topBar}>
      <Pressable accessibilityRole="button" accessibilityLabel="戻る" style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 42,
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
  emptyBlock: {
    gap: spacing.md,
  },
  countryInfo: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  heroFlag: {
    fontSize: 54,
  },
  summaryText: {
    flex: 1,
    gap: 4,
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
  visitTabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  visitTabsScroll: {
    flex: 1,
  },
  visitTabs: {
    gap: spacing.sm,
    paddingRight: spacing.sm,
  },
  trashButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
    backgroundColor: colors.paper,
    borderColor: colors.border,
    borderWidth: 1,
    boxShadow: shadows.soft,
  },
  visitTab: {
    minWidth: 72,
    minHeight: 38,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: radius.round,
    borderColor: colors.border,
    borderWidth: 1,
    backgroundColor: colors.paper,
    boxShadow: shadows.soft,
  },
  visitTabActive: {
    backgroundColor: colors.accentGold,
    borderColor: '#8C5E1D',
  },
  visitTabText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '900',
  },
  visitTabTextActive: {
    color: colors.white,
  },
  visitInfoCard: {
    gap: spacing.md,
  },
  infoLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  infoLabel: {
    width: 72,
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '800',
  },
  infoValue: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '800',
  },
  flexFiller: {
    flex: 1,
  },
  datePickerWrap: {
    marginHorizontal: -spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255, 250, 238, 0.55)',
  },
  cityBlock: {
    gap: spacing.sm,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chipWithDelete: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 32,
    paddingLeft: spacing.md,
    paddingRight: 4,
    borderRadius: radius.round,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.paper,
  },
  chipText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '800',
  },
  chipDelete: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
    backgroundColor: 'rgba(84, 55, 21, 0.10)',
  },
  addCityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 32,
    paddingHorizontal: spacing.md,
    borderRadius: radius.round,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.accentTealDark,
    backgroundColor: 'rgba(47, 155, 145, 0.08)',
  },
  addCityText: {
    color: colors.accentTealDark,
    fontSize: 13,
    fontWeight: '800',
  },
  cityInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  cityInput: {
    minWidth: 120,
    minHeight: 36,
    paddingHorizontal: spacing.md,
    borderRadius: radius.round,
    borderWidth: 1,
    borderColor: colors.accentTealDark,
    backgroundColor: colors.white,
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  cityCommit: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: colors.accentTealDark,
  },
  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '900',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  photoTile: {
    width: '31%',
    aspectRatio: 1,
    overflow: 'hidden',
    borderRadius: radius.md,
    backgroundColor: colors.paperDeep,
    borderColor: colors.border,
    borderWidth: 1,
  },
  photoDelete: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(255, 248, 234, 0.92)',
    borderColor: colors.border,
    borderWidth: 1,
  },
  addPhotoTile: {
    width: '31%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.accentTealDark,
    backgroundColor: 'rgba(47, 155, 145, 0.06)',
  },
  addPhotoLabel: {
    color: colors.accentTealDark,
    fontSize: 12,
    fontWeight: '800',
  },
  memoList: {
    gap: spacing.md,
  },
  memoCard: {
    gap: spacing.sm,
  },
  memoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  memoTitle: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '900',
  },
  memoDelete: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    backgroundColor: 'rgba(84, 55, 21, 0.10)',
  },
  memoContent: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
  memoEmpty: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  memoInput: {
    minHeight: 80,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.accentTealDark,
    backgroundColor: colors.white,
    color: colors.textPrimary,
    fontSize: 14,
    lineHeight: 20,
  },
  addMemoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    minHeight: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.accentTealDark,
    backgroundColor: 'rgba(47, 155, 145, 0.06)',
  },
  addMemoButtonDisabled: {
    borderColor: colors.border,
    backgroundColor: 'rgba(84, 55, 21, 0.04)',
  },
  addMemoText: {
    color: colors.accentTealDark,
    fontSize: 14,
    fontWeight: '800',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(40, 24, 8, 0.36)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    gap: spacing.lg,
  },
  modalHandle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
  },
  modalTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
  },
  modalEmpty: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: 14,
  },
  memoTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  memoTypeTile: {
    width: '47.8%',
    minHeight: 100,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radius.md,
    borderColor: colors.border,
    borderWidth: 1,
    backgroundColor: colors.paper,
    boxShadow: shadows.soft,
  },
  memoTypeIcon: {
    fontSize: 28,
  },
  memoTypeText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 18,
  },
  modalCancel: {
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: radius.round,
    backgroundColor: colors.paper,
    borderColor: colors.border,
    borderWidth: 1,
  },
  modalCancelText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '800',
  },
});
