import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppScreen, CountryRow, EmptyState, PaperCard, PrimaryButton, SearchInput } from '@/components';
import { FREE_PHOTO_LIMIT } from '@/constants';
import { COUNTRY_BY_ID, MEMO_CARD_DEFINITIONS, searchCountries } from '@/data';
import { getCountrySummaries, getVisitedCountryIds } from '@/features';
import { useTravel } from '@/hooks';
import { formatDateSlash, fromISODate, isValidISODate, pickAndStoreVisitPhotos, toISODate, todayISO } from '@/lib';
import { colors, radius, shadows, spacing } from '@/theme';
import type { MemoType } from '@/types';

const STEP_TITLES = ['国を選択', '訪問日と都市', '写真を追加', 'メモを選択', 'メモを入力', '登録完了'];

export default function AddVisitScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ countryId?: string }>();
  const { data, addVisit } = useTravel();
  const visitedIds = getVisitedCountryIds(data);
  const countrySummaries = getCountrySummaries(data);
  const visitCountByCountry = useMemo(
    () => Object.fromEntries(countrySummaries.map((summary) => [summary.country.id, summary.visitCount])),
    [countrySummaries],
  );

  const [step, setStep] = useState(0);
  const [countryId, setCountryId] = useState(params.countryId && COUNTRY_BY_ID[params.countryId] ? params.countryId : '');
  const [countryQuery, setCountryQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'visited' | 'unvisited'>('all');
  const [visitedAt, setVisitedAt] = useState(todayISO());
  const [isDatePickerOpen, setDatePickerOpen] = useState(false);
  const [cityInput, setCityInput] = useState('');
  const [cityNames, setCityNames] = useState<string[]>([]);
  const [photoUris, setPhotoUris] = useState<string[]>([]);
  const [selectedMemoTypes, setSelectedMemoTypes] = useState<MemoType[]>([]);
  const [memoContents, setMemoContents] = useState<Record<MemoType, string>>({
    learned: '',
    food: '',
    culture_shock: '',
    free_note: '',
    people: '',
    next_time: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  const selectedCountry = countryId ? COUNTRY_BY_ID[countryId] : null;
  const isPremium = data.purchase.isPremium;

  useEffect(() => {
    if (params.countryId && COUNTRY_BY_ID[params.countryId]) {
      setCountryId(params.countryId);
      setStep(1);
    }
  }, [params.countryId]);

  const countries = useMemo(() => {
    return searchCountries(countryQuery)
      .filter((country) => {
        if (filter === 'visited') {
          return visitedIds.has(country.id);
        }
        if (filter === 'unvisited') {
          return !visitedIds.has(country.id);
        }
        return true;
      })
      .slice(0, 30);
  }, [countryQuery, filter, visitedIds]);

  function addCity() {
    const trimmed = cityInput.trim();
    if (!trimmed || cityNames.includes(trimmed)) {
      setCityInput('');
      return;
    }
    setCityNames((current) => [...current, trimmed]);
    setCityInput('');
  }

  function removeCity(name: string) {
    setCityNames((current) => current.filter((city) => city !== name));
  }

  async function pickPhotos() {
    try {
      const result = await pickAndStoreVisitPhotos(photoUris.length, isPremium);
      if (result.limitReached) {
        Alert.alert('写真の上限です', `無料版では1訪問あたり${FREE_PHOTO_LIMIT}枚まで追加できます。`);
        return;
      }
      setPhotoUris((current) => [...current, ...result.uris].slice(0, isPremium ? undefined : FREE_PHOTO_LIMIT));
    } catch (caught) {
      Alert.alert('写真を追加できませんでした', caught instanceof Error ? caught.message : 'もう一度お試しください。');
    }
  }

  function toggleMemo(type: MemoType) {
    setSelectedMemoTypes((current) => (current.includes(type) ? current.filter((item) => item !== type) : [...current, type]));
  }

  function handleDateChange(_event: DateTimePickerEvent, next?: Date) {
    if (!next) return;
    const iso = toISODate(next);
    if (iso !== visitedAt) {
      setVisitedAt(iso);
    }
    setDatePickerOpen(false);
  }

  function goNextFromDetails() {
    const trimmed = cityInput.trim();
    if (trimmed && !cityNames.includes(trimmed)) {
      setCityNames((current) => [...current, trimmed]);
      setCityInput('');
    }

    if (!isValidISODate(visitedAt)) {
      Alert.alert('日付を確認してください', '訪問日は 2025-05-12 の形式で入力してください。');
      return;
    }

    setStep(2);
  }

  async function saveVisit() {
    if (!selectedCountry) {
      Alert.alert('国を選択してください', '訪問記録を保存するには国の選択が必要です。');
      setStep(0);
      return;
    }

    if (!isValidISODate(visitedAt)) {
      Alert.alert('日付を確認してください', '訪問日は 2025-05-12 の形式で入力してください。');
      setStep(1);
      return;
    }

    setIsSaving(true);
    try {
      await addVisit({
        countryId: selectedCountry.id,
        visitedAt,
        cityNames,
        photoUris,
        memos: selectedMemoTypes.map((type) => ({ type, content: memoContents[type] ?? '' })),
      });
      setStep(5);
    } catch (caught) {
      Alert.alert('保存できませんでした', caught instanceof Error ? caught.message : 'もう一度お試しください。');
    } finally {
      setIsSaving(false);
    }
  }

  function finish() {
    if (selectedCountry) {
      router.replace({ pathname: '/country/[countryId]', params: { countryId: selectedCountry.id } });
      return;
    }
    router.replace('/');
  }

  return (
    <AppScreen
      title={STEP_TITLES[step]}
      subtitle={`訪問記録の追加 ${Math.min(step + 1, STEP_TITLES.length)} / ${STEP_TITLES.length}`}
      right={
        <Pressable accessibilityRole="button" accessibilityLabel="閉じる" style={styles.closeButton} onPress={() => router.back()}>
          <Ionicons name="close" size={22} color={colors.textPrimary} />
        </Pressable>
      }
    >
      <StepDots step={step} />
      {step === 0 ? (
        <View style={styles.block}>
          <SearchInput value={countryQuery} onChangeText={setCountryQuery} placeholder="国名で検索" />
          <View style={styles.segment}>
            <SegmentButton label="すべて" active={filter === 'all'} onPress={() => setFilter('all')} />
            <SegmentButton label="訪問済み" active={filter === 'visited'} onPress={() => setFilter('visited')} />
            <SegmentButton label="未訪問" active={filter === 'unvisited'} onPress={() => setFilter('unvisited')} />
          </View>
          <View style={styles.countryList}>
            {countries.map((country) => {
              const visitCount = visitCountByCountry[country.id] ?? 0;
              const visited = visitCount > 0;
              return (
                <CountryRow
                  key={country.id}
                  country={country}
                  meta={visited ? `訪問済み ${visitCount}回` : '未訪問'}
                  selected={country.id === countryId}
                  onPress={() => {
                    setCountryId(country.id);
                    setStep(1);
                  }}
                />
              );
            })}
          </View>
        </View>
      ) : null}

      {step === 1 && selectedCountry ? (
        <View style={styles.block}>
          <PaperCard inset style={styles.selectedCountry}>
            <Text style={styles.largeFlag}>{selectedCountry.flag}</Text>
            <View style={styles.countryNameBlock}>
              <Text selectable style={styles.selectedCountryName}>
                {selectedCountry.nameJa}
              </Text>
              <Text selectable style={styles.selectedCountryMeta}>
                次は {(visitCountByCountry[selectedCountry.id] ?? 0) + 1}回目の訪問として保存されます
              </Text>
            </View>
          </PaperCard>
          <View style={styles.field}>
            <Text selectable style={styles.fieldLabel}>
              訪問日
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`訪問日 ${formatDateSlash(visitedAt)}  タップで編集`}
              style={styles.dateRow}
              onPress={() => setDatePickerOpen((prev) => !prev)}
            >
              <Ionicons name="calendar-outline" size={18} color={colors.accentTealDark} />
              <Text selectable style={styles.dateValue}>
                {formatDateSlash(visitedAt)}
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
                  value={fromISODate(visitedAt)}
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
          </View>
          <View style={styles.field}>
            <Text selectable style={styles.fieldLabel}>
              訪問した都市（複数可）
            </Text>
            <View style={styles.cityInputRow}>
              <TextInput value={cityInput} onChangeText={setCityInput} placeholder="バンコク" style={[styles.input, styles.cityInput]} onSubmitEditing={addCity} />
              <Pressable accessibilityRole="button" style={styles.addCityButton} onPress={addCity}>
                <Ionicons name="add" size={20} color={colors.textPrimary} />
              </Pressable>
            </View>
            <View style={styles.chipWrap}>
              {cityNames.map((city) => (
                <Pressable key={city} style={styles.chip} onPress={() => removeCity(city)}>
                  <Text selectable style={styles.chipText}>
                    {city} ×
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
          <PrimaryButton label="次へ" onPress={goNextFromDetails} />
        </View>
      ) : null}

      {step === 2 ? (
        <View style={styles.block}>
          <Text selectable style={styles.helper}>
            {isPremium ? '有料版扱いのため写真は無制限で追加できます。' : `あと${Math.max(FREE_PHOTO_LIMIT - photoUris.length, 0)}枚まで追加できます（無料プラン）。`}
          </Text>
          {photoUris.length > 0 ? (
            <View style={styles.photoGrid}>
              {photoUris.map((uri) => (
                <View key={uri} style={styles.photoThumb}>
                  <Image source={{ uri }} style={StyleSheet.absoluteFill} contentFit="cover" />
                  <Pressable style={styles.removePhoto} onPress={() => setPhotoUris((current) => current.filter((item) => item !== uri))}>
                    <Ionicons name="close" size={14} color={colors.textPrimary} />
                  </Pressable>
                </View>
              ))}
            </View>
          ) : (
            <EmptyState icon="📷" title="写真なしでも保存できます" body="写真は後から対応しやすいよう、訪問回ごとに分けて保存します。" />
          )}
          <Pressable style={styles.addPhotoBox} onPress={pickPhotos}>
            <Ionicons name="add-circle-outline" size={28} color={colors.accentTealDark} />
            <Text selectable style={styles.addPhotoText}>
              写真を追加
            </Text>
          </Pressable>
          <PrimaryButton label="次へ" onPress={() => setStep(3)} />
        </View>
      ) : null}

      {step === 3 ? (
        <View style={styles.block}>
          <Text selectable style={styles.helper}>
            記録したい内容だけ選んでください。何も選ばなくても保存できます。
          </Text>
          <View style={styles.memoGrid}>
            {MEMO_CARD_DEFINITIONS.map((memo) => {
              const selected = selectedMemoTypes.includes(memo.type);
              return (
                <Pressable key={memo.type} style={[styles.memoOption, selected && styles.memoOptionSelected]} onPress={() => toggleMemo(memo.type)}>
                  <Text style={styles.memoIcon}>{memo.icon}</Text>
                  <Text selectable style={styles.memoOptionText}>
                    {memo.title}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <PrimaryButton label="次へ" onPress={() => setStep(4)} />
        </View>
      ) : null}

      {step === 4 ? (
        <View style={styles.block}>
          {selectedMemoTypes.length > 0 ? (
            selectedMemoTypes.map((type) => {
              const definition = MEMO_CARD_DEFINITIONS.find((memo) => memo.type === type);
              if (!definition) {
                return null;
              }

              return (
                <PaperCard key={type} inset style={styles.memoInputCard}>
                  <Text selectable style={styles.memoInputTitle}>
                    {definition.icon} {definition.title}
                  </Text>
                  <TextInput
                    value={memoContents[type]}
                    onChangeText={(text) => setMemoContents((current) => ({ ...current, [type]: text }))}
                    placeholder={definition.placeholder}
                    multiline
                    maxLength={300}
                    style={styles.memoInput}
                    textAlignVertical="top"
                  />
                  <Text selectable style={styles.counter}>
                    {(memoContents[type] ?? '').length}/300
                  </Text>
                </PaperCard>
              );
            })
          ) : (
            <EmptyState icon="📝" title="メモなしで登録します" body="メモは完全任意です。登録後の詳細画面には空欄カードを表示しません。" />
          )}
          <PrimaryButton label="登録する" loading={isSaving} onPress={saveVisit} />
        </View>
      ) : null}

      {step === 5 && selectedCountry ? (
        <View style={styles.block}>
          <View style={styles.completeBadge}>
            <Ionicons name="checkmark" size={46} color={colors.white} />
          </View>
          <PaperCard style={styles.completeCard}>
            <Text style={styles.largeFlag}>{selectedCountry.flag}</Text>
            <Text selectable style={styles.completeTitle}>
              登録が完了しました！
            </Text>
            <Text selectable style={styles.completeMeta}>
              {selectedCountry.nameJa}・{visitedAt}
            </Text>
            <Text selectable style={styles.completeMeta}>
              {cityNames.length > 0 ? cityNames.join('、') : '都市なし'}
            </Text>
          </PaperCard>
          <PrimaryButton label="完了" onPress={finish} />
        </View>
      ) : null}
    </AppScreen>
  );
}

function StepDots({ step }: { step: number }) {
  return (
    <View style={styles.stepDots}>
      {STEP_TITLES.map((_, index) => (
        <View key={index} style={[styles.stepDot, index <= step && styles.stepDotActive]} />
      ))}
    </View>
  );
}

function SegmentButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable style={[styles.segmentButton, active && styles.segmentButtonActive]} onPress={onPress}>
      <Text selectable style={[styles.segmentText, active && styles.segmentTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  closeButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 21,
    backgroundColor: colors.paper,
    borderColor: colors.border,
    borderWidth: 1,
  },
  stepDots: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  stepDot: {
    flex: 1,
    height: 5,
    borderRadius: 999,
    backgroundColor: '#E4D3B6',
  },
  stepDotActive: {
    backgroundColor: colors.accentTeal,
  },
  block: {
    gap: spacing.md,
  },
  segment: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: 4,
    borderRadius: radius.round,
    backgroundColor: 'rgba(255, 250, 238, 0.8)',
    borderWidth: 1,
    borderColor: colors.border,
  },
  segmentButton: {
    flex: 1,
    minHeight: 34,
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentButtonActive: {
    backgroundColor: colors.accentTeal,
  },
  segmentText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '800',
  },
  segmentTextActive: {
    color: colors.white,
  },
  countryList: {
    gap: spacing.sm,
  },
  selectedCountry: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  largeFlag: {
    fontSize: 44,
  },
  countryNameBlock: {
    flex: 1,
    gap: 4,
  },
  selectedCountryName: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '900',
  },
  selectedCountryMeta: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  },
  field: {
    gap: spacing.sm,
  },
  fieldLabel: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '800',
  },
  input: {
    minHeight: 50,
    borderRadius: radius.md,
    borderColor: colors.border,
    borderWidth: 1,
    backgroundColor: 'rgba(255, 250, 238, 0.92)',
    paddingHorizontal: spacing.md,
    color: colors.textPrimary,
    fontSize: 15,
  },
  dateRow: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.md,
    borderColor: colors.border,
    borderWidth: 1,
    backgroundColor: 'rgba(255, 250, 238, 0.92)',
    paddingHorizontal: spacing.md,
  },
  dateValue: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '800',
  },
  datePickerWrap: {
    marginHorizontal: -spacing.xs,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255, 250, 238, 0.55)',
  },
  cityInputRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  cityInput: {
    flex: 1,
  },
  addCityButton: {
    width: 50,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    borderColor: colors.border,
    borderWidth: 1,
    backgroundColor: colors.backgroundSoft,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    minHeight: 34,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
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
  helper: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  photoThumb: {
    width: '30.9%',
    aspectRatio: 1,
    overflow: 'hidden',
    borderRadius: radius.md,
    backgroundColor: colors.paperDeep,
    borderColor: colors.border,
    borderWidth: 1,
  },
  removePhoto: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(255, 248, 234, 0.9)',
  },
  addPhotoBox: {
    minHeight: 92,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    backgroundColor: 'rgba(255, 250, 238, 0.72)',
  },
  addPhotoText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '800',
  },
  memoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  memoOption: {
    width: '47.8%',
    minHeight: 110,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    borderColor: colors.border,
    borderWidth: 1,
    backgroundColor: colors.paper,
    boxShadow: shadows.soft,
  },
  memoOptionSelected: {
    borderColor: colors.accentTeal,
    backgroundColor: '#E7F5F1',
  },
  memoIcon: {
    fontSize: 30,
  },
  memoOptionText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 18,
  },
  memoInputCard: {
    gap: spacing.sm,
  },
  memoInputTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '900',
  },
  memoInput: {
    minHeight: 116,
    borderRadius: radius.md,
    borderColor: colors.border,
    borderWidth: 1,
    backgroundColor: colors.white,
    padding: spacing.md,
    color: colors.textPrimary,
    fontSize: 14,
    lineHeight: 20,
  },
  counter: {
    color: colors.textMuted,
    fontSize: 11,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
  completeBadge: {
    alignSelf: 'center',
    width: 82,
    height: 82,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 41,
    backgroundColor: colors.visited,
    borderColor: '#DDF0DF',
    borderWidth: 6,
    boxShadow: shadows.button,
  },
  completeCard: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  completeTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '900',
  },
  completeMeta: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '700',
  },
});
