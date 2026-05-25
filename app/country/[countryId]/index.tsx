import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Modal,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { AppScreen, EmptyState, MemoSwipeRow, PaperCard, PrimaryButton, useUndoToast } from '@/components';
import { FREE_PHOTO_LIMIT } from '@/constants';
import { COUNTRY_BY_ID, MEMO_CARD_DEFINITIONS, getMemoDefinition } from '@/data';
import { getCountrySummary, isCountryInBucket } from '@/features';
import { useTravel } from '@/hooks';
import { formatDateSlash, fromISODate, pickAndStoreVisitPhotos, toISODate } from '@/lib';
import { colors, radius, shadows, spacing } from '@/theme';
import type { City, MemoCard, MemoType, Photo } from '@/types';

const PHOTOS_PER_ROW = 3;
const DEFAULT_PHOTO_ROWS = 3;
const DEFAULT_PHOTO_LIMIT = PHOTOS_PER_ROW * DEFAULT_PHOTO_ROWS;

type MemoFilter = 'all' | MemoType;

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
  const [isCityEditing, setCityEditing] = useState(false);
  const [cityDraft, setCityDraft] = useState('');
  const [isCityInputOpen, setCityInputOpen] = useState(false);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [memoFilter, setMemoFilter] = useState<MemoFilter>('all');
  const [editingMemoId, setEditingMemoId] = useState<string | null>(null);
  const [memoDraft, setMemoDraft] = useState('');
  const [isMemoPickerOpen, setMemoPickerOpen] = useState(false);

  // メモ編集時に該当行をキーボード上にスクロールさせるための参照
  const scrollViewRef = useRef<ScrollView | null>(null);
  const memoRowRefs = useRef<Map<string, View>>(new Map());
  const scrollOffsetRef = useRef(0);

  const registerMemoRef = useCallback((memoId: string, node: View | null) => {
    if (node) {
      memoRowRefs.current.set(memoId, node);
    } else {
      memoRowRefs.current.delete(memoId);
    }
  }, []);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollOffsetRef.current = event.nativeEvent.contentOffset.y;
  }, []);

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
    setCityEditing(false);
    setCityDraft('');
    setCityInputOpen(false);
    setShowAllPhotos(false);
    setMemoFilter('all');
    setEditingMemoId(null);
    setMemoDraft('');
  }, [selectedVisit?.visit.id]);

  // メモが編集状態になったら、その行をキーボードの上にスクロールさせる。
  // 新アーキテクチャ（Fabric）では measureLayout の第1引数が厳しくなるため、
  // measure() で screen Y を取り、現在のスクロールオフセットと組み合わせてスクロール先を計算する。
  useEffect(() => {
    if (!editingMemoId) return;
    const scrollViewNode = scrollViewRef.current;
    if (!scrollViewNode) return;

    // 新規追加直後は layout が確定するまでに時間がかかるので少し待つ。
    const timer = setTimeout(() => {
      const rowNode = memoRowRefs.current.get(editingMemoId);
      if (!rowNode || typeof rowNode.measure !== 'function') return;
      rowNode.measure((_x, _y, _width, _height, _pageX, pageY) => {
        // 行の上端を画面上部から 140px のあたりに置き、キーボード上に確実に見える位置にする。
        const desiredScreenY = 140;
        const delta = pageY - desiredScreenY;
        const nextOffset = Math.max(0, scrollOffsetRef.current + delta);
        scrollViewNode.scrollTo({ y: nextOffset, animated: true });
      });
    }, 180);

    return () => clearTimeout(timer);
  }, [editingMemoId]);

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

  const openMoreMenu = useCallback(() => {
    Alert.alert(
      '操作',
      undefined,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: 'この訪問記録を削除',
          style: 'destructive',
          onPress: confirmDeleteVisit,
        },
      ],
    );
  }, [confirmDeleteVisit]);

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
      // 写真ピッカー〜保存までの失敗原因を後で追えるよう、警告ログを残しておく。
      console.warn('[country] handlePickPhotos failed', caught);
      Alert.alert(
        '写真を追加できませんでした',
        caught instanceof Error ? caught.message : 'もう一度お試しください。',
      );
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
        setMemoFilter('all');
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
    async (memo: MemoCard, close?: () => void) => {
      try {
        const removed = await removeMemo(memo.id);
        if (!removed) {
          close?.();
          return;
        }
        close?.();
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

  const filteredMemos = useMemo(() => {
    if (!selectedVisit) return [];
    if (memoFilter === 'all') return selectedVisit.memos;
    return selectedVisit.memos.filter((memo) => memo.type === memoFilter);
  }, [memoFilter, selectedVisit]);

  if (!country) {
    return (
      <AppScreen>
        <TopBar />
        <EmptyState icon="🗺️" title="国が見つかりません" body="国マスタに存在しない国IDです。" />
      </AppScreen>
    );
  }

  const hasOverflowPhotos = (selectedVisit?.photos.length ?? 0) > DEFAULT_PHOTO_LIMIT;
  const visiblePhotos = selectedVisit
    ? showAllPhotos
      ? selectedVisit.photos
      : selectedVisit.photos.slice(0, DEFAULT_PHOTO_LIMIT)
    : [];

  return (
    <AppScreen scrollViewRef={scrollViewRef} onScroll={handleScroll}>
      <TopBar onMore={summary ? openMoreMenu : undefined} />
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
          <PaperCard inset style={styles.summaryCard}>
            <View style={styles.summaryHeaderRow}>
              <Text style={styles.heroFlag}>{country.flag}</Text>
              <View style={styles.summaryText}>
                <Text selectable style={styles.countryName}>
                  {country.nameJa}
                </Text>
                <Text selectable style={styles.countryMeta}>
                  訪問回数 {summary.visitCount}回・最終訪問日 {formatDateSlash(summary.lastVisitedAt)}
                </Text>
              </View>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.visitTabs}
              style={styles.visitTabsScroll}
            >
              {summary.visits.map((bundle, index) => {
                const active = bundle.visit.id === selectedVisit.visit.id;
                return (
                  <Pressable
                    key={bundle.visit.id}
                    accessibilityRole="button"
                    accessibilityLabel={`${index + 1}回目 ${formatDateSlash(bundle.visit.visitedAt)}`}
                    accessibilityState={{ selected: active }}
                    style={[styles.visitTab, active && styles.visitTabActive]}
                    onPress={() => setSelectedVisitId(bundle.visit.id)}
                  >
                    <Text selectable style={[styles.visitTabText, active && styles.visitTabTextActive]}>
                      {index + 1}回目
                    </Text>
                    <Text selectable style={[styles.visitTabSubText, active && styles.visitTabSubTextActive]}>
                      {formatDateSlash(bundle.visit.visitedAt)}
                    </Text>
                  </Pressable>
                );
              })}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="この国に新しい訪問を追加"
                style={styles.addVisitPill}
                onPress={() => router.push({ pathname: '/add', params: { countryId: country.id } })}
              >
                <Ionicons name="add" size={16} color={colors.accentTealDark} />
                <Text selectable style={styles.addVisitText}>
                  訪問を追加
                </Text>
              </Pressable>
            </ScrollView>
          </PaperCard>

          <PaperCard inset style={styles.visitInfoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={18} color={colors.accentTealDark} />
              <Text selectable style={styles.infoLabel}>
                訪問日
              </Text>
              <Text selectable style={styles.infoValue}>
                {formatDateSlash(selectedVisit.visit.visitedAt)}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="訪問日を編集"
                hitSlop={6}
                style={styles.editIconButton}
                onPress={() => setDatePickerOpen((prev) => !prev)}
              >
                <Ionicons
                  name={isDatePickerOpen ? 'chevron-up' : 'pencil-outline'}
                  size={16}
                  color={colors.textMuted}
                />
              </Pressable>
            </View>
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

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={18} color={colors.accentTealDark} />
              <Text selectable style={styles.infoLabel}>
                訪問都市
              </Text>
              <View style={styles.cityValueArea}>
                {selectedVisit.cities.length === 0 && !isCityEditing ? (
                  <Text selectable style={styles.cityEmptyInline}>
                    未登録
                  </Text>
                ) : (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    style={styles.cityChipScroll}
                    contentContainerStyle={styles.cityChipRow}
                  >
                    {selectedVisit.cities.map((city) =>
                      isCityEditing ? (
                        <View key={city.id} style={styles.chipWithDelete}>
                          <Text selectable style={styles.chipText} numberOfLines={1}>
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
                      ) : (
                        <View key={city.id} style={styles.chip}>
                          <Text selectable style={styles.chipText} numberOfLines={1}>
                            {city.name}
                          </Text>
                        </View>
                      ),
                    )}
                    {isCityEditing ? (
                      isCityInputOpen ? (
                        <View style={styles.cityInputRow}>
                          <TextInput
                            value={cityDraft}
                            onChangeText={setCityDraft}
                            autoFocus
                            placeholder="例: バンコク"
                            placeholderTextColor={colors.textMuted}
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
                      )
                    ) : null}
                  </ScrollView>
                )}
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={isCityEditing ? '訪問都市の編集を終える' : '訪問都市を編集'}
                hitSlop={6}
                style={styles.editIconButton}
                onPress={() => {
                  if (isCityEditing) {
                    setCityInputOpen(false);
                    setCityDraft('');
                  }
                  setCityEditing((prev) => !prev);
                }}
              >
                <Ionicons
                  name={isCityEditing ? 'checkmark' : 'pencil-outline'}
                  size={16}
                  color={isCityEditing ? colors.accentTealDark : colors.textMuted}
                />
              </Pressable>
            </View>
          </PaperCard>

          <PaperCard inset style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="image-outline" size={18} color={colors.textPrimary} />
                <Text selectable style={styles.sectionTitle}>
                  写真
                </Text>
              </View>
              {hasOverflowPhotos ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={showAllPhotos ? '写真の表示を折りたたむ' : 'すべての写真を見る'}
                  hitSlop={6}
                  onPress={() => setShowAllPhotos((prev) => !prev)}
                >
                  <Text selectable style={styles.seeAllText}>
                    {showAllPhotos ? '折りたたむ' : `すべてを見る ›`}
                  </Text>
                </Pressable>
              ) : null}
            </View>
            {visiblePhotos.length > 0 ? (
              <View style={styles.photoGrid}>
                {visiblePhotos.map((photo) => (
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
              </View>
            ) : null}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="写真を追加"
              style={styles.addPhotoButton}
              onPress={handlePickPhotos}
            >
              <Ionicons name="add" size={18} color={colors.accentTealDark} />
              <Text selectable style={styles.addPhotoLabel}>
                写真を追加
              </Text>
            </Pressable>
          </PaperCard>

          <PaperCard inset style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="document-text-outline" size={18} color={colors.textPrimary} />
                <Text selectable style={styles.sectionTitle}>
                  メモ
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="メモを追加"
                hitSlop={6}
                style={styles.addMemoChip}
                onPress={() => setMemoPickerOpen(true)}
              >
                <Ionicons name="add" size={14} color={colors.accentTealDark} />
                <Text selectable style={styles.addMemoChipText}>
                  メモを追加
                </Text>
              </Pressable>
            </View>

            <Text selectable style={styles.filterLabel}>
              フィルター
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterRow}
              style={styles.filterScroll}
            >
              <FilterChip
                label="すべて"
                active={memoFilter === 'all'}
                onPress={() => setMemoFilter('all')}
              />
              {MEMO_CARD_DEFINITIONS.map((def) => (
                <FilterChip
                  key={def.type}
                  icon={def.icon}
                  label={def.title}
                  active={memoFilter === def.type}
                  onPress={() => setMemoFilter(def.type)}
                />
              ))}
            </ScrollView>

            {filteredMemos.length > 0 ? (
              <View style={styles.memoList}>
                {filteredMemos.map((memo) => (
                  <MemoSwipeRow
                    key={memo.id}
                    memo={memo}
                    isEditing={editingMemoId === memo.id}
                    draft={memoDraft}
                    onStartEdit={beginEditMemo}
                    onChangeDraft={setMemoDraft}
                    onSaveEdit={handleSaveMemo}
                    onConfirmDelete={(target, close) => handleRemoveMemo(target, close)}
                    registerRef={registerMemoRef}
                  />
                ))}
              </View>
            ) : (
              <View style={styles.memoEmptyBlock}>
                <Text selectable style={styles.memoEmptyText}>
                  {memoFilter === 'all'
                    ? 'まだメモがありません。右上の「メモを追加」から記録できます。'
                    : 'このタグのメモはまだありません。'}
                </Text>
              </View>
            )}
          </PaperCard>

          <Modal visible={isMemoPickerOpen} animationType="slide" transparent onRequestClose={() => setMemoPickerOpen(false)}>
            <Pressable style={styles.modalBackdrop} onPress={() => setMemoPickerOpen(false)}>
              <Pressable style={styles.modalSheet} onPress={() => {}}>
                <View style={styles.modalHandle} />
                <Text selectable style={styles.modalTitle}>
                  追加するメモを選ぶ
                </Text>
                <View style={styles.memoTypeGrid}>
                  {MEMO_CARD_DEFINITIONS.map((def) => (
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

function TopBar({ onMore }: { onMore?: () => void }) {
  const router = useRouter();

  return (
    <View style={styles.topBar}>
      <Pressable accessibilityRole="button" accessibilityLabel="戻る" style={styles.iconButton} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
      </Pressable>
      <View style={styles.flexFiller} />
      {onMore ? (
        <Pressable accessibilityRole="button" accessibilityLabel="その他の操作" style={styles.iconButton} onPress={onMore}>
          <Ionicons name="ellipsis-horizontal" size={22} color={colors.textPrimary} />
        </Pressable>
      ) : null}
    </View>
  );
}

type FilterChipProps = {
  label: string;
  active: boolean;
  icon?: string;
  onPress: () => void;
};

function FilterChip({ label, active, icon, onPress }: FilterChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}で絞り込む`}
      accessibilityState={{ selected: active }}
      style={[styles.filterChip, active && styles.filterChipActive]}
      onPress={onPress}
    >
      {icon ? <Text style={styles.filterChipIcon}>{icon}</Text> : null}
      <Text selectable style={[styles.filterChipText, active && styles.filterChipTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 42,
  },
  iconButton: {
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
    gap: spacing.md,
  },
  summaryHeaderRow: {
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
  visitTabsScroll: {
    marginHorizontal: -spacing.lg,
  },
  visitTabs: {
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  visitTab: {
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
  visitTabActive: {
    backgroundColor: colors.accentTealDark,
    borderColor: colors.accentTealDark,
  },
  visitTabText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '900',
  },
  visitTabTextActive: {
    color: colors.white,
  },
  visitTabSubText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  visitTabSubTextActive: {
    color: 'rgba(255, 255, 255, 0.86)',
  },
  addVisitPill: {
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
  addVisitText: {
    color: colors.accentTealDark,
    fontSize: 13,
    fontWeight: '800',
  },
  visitInfoCard: {
    gap: spacing.md,
  },
  infoRow: {
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
  editIconButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderColor: colors.border,
    borderWidth: 1,
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
  divider: {
    height: 1,
    backgroundColor: colors.border,
    opacity: 0.6,
  },
  cityValueArea: {
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
  },
  cityEmptyInline: {
    color: colors.textMuted,
    fontSize: 13,
    fontStyle: 'italic',
  },
  cityChipScroll: {
    flexGrow: 0,
  },
  cityChipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingRight: spacing.xs,
  },
  chip: {
    minHeight: 26,
    justifyContent: 'center',
    paddingHorizontal: 10,
    borderRadius: radius.round,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.paper,
  },
  chipWithDelete: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 28,
    paddingLeft: 10,
    paddingRight: 4,
    borderRadius: radius.round,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.paper,
  },
  chipText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  chipDelete: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: 'rgba(84, 55, 21, 0.10)',
  },
  addCityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 28,
    paddingHorizontal: 10,
    borderRadius: radius.round,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.accentTealDark,
    backgroundColor: 'rgba(47, 155, 145, 0.08)',
  },
  addCityText: {
    color: colors.accentTealDark,
    fontSize: 12,
    fontWeight: '800',
  },
  cityInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  cityInput: {
    minWidth: 100,
    minHeight: 30,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.round,
    borderWidth: 1,
    borderColor: colors.accentTealDark,
    backgroundColor: colors.white,
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  cityCommit: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: colors.accentTealDark,
  },
  section: {
    gap: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '900',
  },
  seeAllText: {
    color: colors.accentTealDark,
    fontSize: 13,
    fontWeight: '800',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  photoTile: {
    width: '31.5%',
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
  addPhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    minHeight: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.accentTealDark,
    backgroundColor: 'rgba(47, 155, 145, 0.06)',
  },
  addPhotoLabel: {
    color: colors.accentTealDark,
    fontSize: 13,
    fontWeight: '800',
  },
  addMemoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 32,
    paddingHorizontal: spacing.md,
    borderRadius: radius.round,
    borderWidth: 1,
    borderColor: colors.accentTealDark,
    backgroundColor: 'rgba(47, 155, 145, 0.08)',
  },
  addMemoChipText: {
    color: colors.accentTealDark,
    fontSize: 13,
    fontWeight: '800',
  },
  filterLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '800',
  },
  filterScroll: {
    marginHorizontal: -spacing.lg,
  },
  filterRow: {
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 34,
    paddingHorizontal: spacing.md,
    borderRadius: radius.round,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.paper,
  },
  filterChipActive: {
    backgroundColor: colors.accentTealDark,
    borderColor: colors.accentTealDark,
  },
  filterChipIcon: {
    fontSize: 14,
  },
  filterChipText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '800',
  },
  filterChipTextActive: {
    color: colors.white,
  },
  memoList: {
    gap: spacing.sm,
  },
  memoEmptyBlock: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(255, 250, 238, 0.6)',
  },
  memoEmptyText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
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
