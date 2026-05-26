import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppScreen, EmptyState, PaperCard, PrimaryButton } from '@/components';
import { COUNTRY_BY_ID } from '@/data';
import { getCountrySummary, isCountryInBucket } from '@/features';
import { useTravel } from '@/hooks';
import { spacing, text } from '@/theme';

import { CountryHero } from './_components/country-hero';
import { MemoSection, type MemoFilter } from './_components/memo-section';
import { MemoPickerModal } from './_components/memo-picker-modal';
import { PhotoSection } from './_components/photo-section';
import { TopBar } from './_components/top-bar';
import { VisitInfoCard } from './_components/visit-info-card';
import { useMemoAutoscroll } from './_hooks/use-memo-autoscroll';
import { useVisitEditor } from './_hooks/use-visit-editor';

const PHOTOS_PER_ROW = 3;
const DEFAULT_PHOTO_ROWS = 3;
const DEFAULT_PHOTO_LIMIT = PHOTOS_PER_ROW * DEFAULT_PHOTO_ROWS;

export default function CountryDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ countryId: string; visitId?: string }>();
  const { data, addBucketCountry } = useTravel();
  const country = COUNTRY_BY_ID[params.countryId];
  const summary = getCountrySummary(data, params.countryId);
  const requestedVisitId = typeof params.visitId === 'string' ? params.visitId : null;

  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(summary?.visits[0]?.visit.id ?? null);
  const [appliedRequestedVisitId, setAppliedRequestedVisitId] = useState<string | null>(null);
  const [isDatePickerOpen, setDatePickerOpen] = useState(false);
  const [isCityEditing, setCityEditing] = useState(false);
  const [cityDraft, setCityDraft] = useState('');
  const [isCityInputOpen, setCityInputOpen] = useState(false);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [memoFilter, setMemoFilter] = useState<MemoFilter>('all');
  const [editingMemoId, setEditingMemoId] = useState<string | null>(null);
  const [memoDraft, setMemoDraft] = useState('');
  const [isMemoPickerOpen, setMemoPickerOpen] = useState(false);

  const { scrollViewRef, registerMemoRef, handleScroll } = useMemoAutoscroll(editingMemoId);

  useEffect(() => {
    if (!summary?.visits.length) {
      if (selectedVisitId) {
        setSelectedVisitId(null);
      }
      return;
    }

    if (requestedVisitId && requestedVisitId !== appliedRequestedVisitId) {
      const requestedExists = summary.visits.some((bundle) => bundle.visit.id === requestedVisitId);
      if (requestedExists) {
        setSelectedVisitId(requestedVisitId);
      }
      setAppliedRequestedVisitId(requestedVisitId);
      return;
    }

    const currentExists = selectedVisitId
      ? summary.visits.some((bundle) => bundle.visit.id === selectedVisitId)
      : false;
    if (!currentExists) {
      setSelectedVisitId(summary.visits[0].visit.id);
    }
  }, [appliedRequestedVisitId, requestedVisitId, selectedVisitId, summary]);

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

  const editor = useVisitEditor({
    selectedVisit,
    summary,
    cityDraft,
    memoDraft,
    setSelectedVisitId,
    setDatePickerOpen,
    setCityDraft,
    setCityInputOpen,
    setMemoPickerOpen,
    setEditingMemoId,
    setMemoDraft,
    setMemoFilter,
  });

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
      <TopBar onMore={summary ? editor.openMoreMenu : undefined} />
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
          <CountryHero
            country={country}
            summary={summary}
            selectedVisitId={selectedVisit.visit.id}
            onSelectVisit={setSelectedVisitId}
            onAddVisit={() => router.push({ pathname: '/add', params: { countryId: country.id } })}
          />

          <VisitInfoCard
            visitedAt={selectedVisit.visit.visitedAt}
            cities={selectedVisit.cities}
            isDatePickerOpen={isDatePickerOpen}
            onToggleDatePicker={() => setDatePickerOpen((prev) => !prev)}
            onDateChange={editor.handleDateChange}
            isCityEditing={isCityEditing}
            isCityInputOpen={isCityInputOpen}
            cityDraft={cityDraft}
            onChangeCityDraft={setCityDraft}
            onToggleCityEditing={() => {
              if (isCityEditing) {
                setCityInputOpen(false);
                setCityDraft('');
              }
              setCityEditing((prev) => !prev);
            }}
            onOpenCityInput={() => {
              setCityDraft('');
              setCityInputOpen(true);
            }}
            onAddCity={editor.handleAddCity}
            onRemoveCity={editor.handleRemoveCity}
          />

          <PhotoSection
            isPremium={editor.isPremium}
            photoCount={selectedVisit.photos.length}
            visiblePhotos={visiblePhotos}
            hasOverflow={hasOverflowPhotos}
            showAll={showAllPhotos}
            onToggleShowAll={() => setShowAllPhotos((prev) => !prev)}
            onPickPhotos={editor.handlePickPhotos}
            onRemovePhoto={editor.handleRemovePhoto}
          />

          <MemoSection
            memos={filteredMemos}
            filter={memoFilter}
            onChangeFilter={setMemoFilter}
            onOpenPicker={() => setMemoPickerOpen(true)}
            editingMemoId={editingMemoId}
            memoDraft={memoDraft}
            onStartEdit={editor.beginEditMemo}
            onChangeDraft={setMemoDraft}
            onSaveEdit={editor.handleSaveMemo}
            onConfirmDelete={editor.handleRemoveMemo}
            registerMemoRef={registerMemoRef}
          />

          <MemoPickerModal
            visible={isMemoPickerOpen}
            onClose={() => setMemoPickerOpen(false)}
            onPick={editor.handleAddMemo}
          />
        </>
      ) : null}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  emptyBlock: {
    gap: spacing.md,
  },
  countryInfo: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  heroFlag: {
    fontSize: 54,
  },
  countryName: text.countryName,
  countryMeta: text.countryMeta,
});
