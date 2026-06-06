import { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';

import { FREE_PHOTO_LIMIT } from '@/constants';
import { COUNTRY_BY_ID, searchCountries } from '@/data';
import {
  canRegisterVisitCountry,
  getCountrySummaries,
  getVisitedCountryIds,
} from '@/features';
import { usePremiumMediaPicker } from '@/features/visit-media/use-premium-media-picker';
import { usePremium, usePremiumActions, useTravel } from '@/hooks';
import {
  isValidISODate,
  PREMIUM_COUNTRY_LIMIT_BODY,
  PREMIUM_COUNTRY_LIMIT_CTA,
  PREMIUM_COUNTRY_LIMIT_TITLE,
  toISODate,
  todayISO,
} from '@/lib';
import type { MemoType, StoredVisitMediaInput } from '@/types';

import { type CountryFilter } from '../_constants';

const EMPTY_MEMO_CONTENTS: Record<MemoType, string> = {
  learned: '',
  food: '',
  culture_shock: '',
  free_note: '',
  people: '',
  next_time: '',
};

/**
 * 訪問記録追加フローの state と handler を一括で扱うフック。
 * 各 step コンポーネントは、ここから返される値だけを受け取って描画する。
 */
export function useAddVisitForm() {
  const router = useRouter();
  const params = useLocalSearchParams<{ countryId?: string }>();
  const { data, addVisit } = useTravel();
  const { isPremium } = usePremium();
  const { purchasePremiumWithFeedback } = usePremiumActions();
  const { pickVisitMediaWithPremiumGate } = usePremiumMediaPicker();

  const visitedIds = getVisitedCountryIds(data);
  const countrySummaries = getCountrySummaries(data);
  const visitCountByCountry = useMemo(
    () => Object.fromEntries(countrySummaries.map((summary) => [summary.country.id, summary.visitCount])),
    [countrySummaries],
  );

  const [step, setStep] = useState(0);
  const [countryId, setCountryId] = useState(
    params.countryId && COUNTRY_BY_ID[params.countryId] ? params.countryId : '',
  );
  const [countryQuery, setCountryQuery] = useState('');
  const [filter, setFilter] = useState<CountryFilter>('all');
  const [visitedAt, setVisitedAt] = useState(todayISO());
  const [isDatePickerOpen, setDatePickerOpen] = useState(false);
  const [cityInput, setCityInput] = useState('');
  const [cityNames, setCityNames] = useState<string[]>([]);
  const [mediaItems, setMediaItems] = useState<StoredVisitMediaInput[]>([]);
  const [selectedMemoTypes, setSelectedMemoTypes] = useState<MemoType[]>([]);
  const [memoContents, setMemoContents] = useState<Record<MemoType, string>>(EMPTY_MEMO_CONTENTS);
  const [isSaving, setIsSaving] = useState(false);

  const selectedCountry = countryId ? COUNTRY_BY_ID[countryId] : null;

  const showCountryLimitAlert = useCallback(() => {
    Alert.alert(PREMIUM_COUNTRY_LIMIT_TITLE, PREMIUM_COUNTRY_LIMIT_BODY, [
      { text: 'あとで', style: 'cancel' },
      {
        text: PREMIUM_COUNTRY_LIMIT_CTA,
        onPress: purchasePremiumWithFeedback,
      },
    ]);
  }, [purchasePremiumWithFeedback]);

  const canSelectCountry = useCallback(
    (id: string) => canRegisterVisitCountry(data, id, isPremium),
    [data, isPremium],
  );

  useEffect(() => {
    if (!params.countryId || !COUNTRY_BY_ID[params.countryId]) {
      return;
    }

    if (!canSelectCountry(params.countryId)) {
      setCountryId('');
      setStep(0);
      showCountryLimitAlert();
      return;
    }

    setCountryId(params.countryId);
    setStep(1);
  }, [canSelectCountry, params.countryId, showCountryLimitAlert]);

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

  const selectCountry = useCallback(
    (id: string) => {
      if (!canSelectCountry(id)) {
        showCountryLimitAlert();
        return;
      }

      setCountryId(id);
      setStep(1);
    },
    [canSelectCountry, showCountryLimitAlert],
  );

  const addCity = useCallback(() => {
    const trimmed = cityInput.trim();
    if (!trimmed || cityNames.includes(trimmed)) {
      setCityInput('');
      return;
    }
    setCityNames((current) => [...current, trimmed]);
    setCityInput('');
  }, [cityInput, cityNames]);

  const removeCity = useCallback((name: string) => {
    setCityNames((current) => current.filter((city) => city !== name));
  }, []);

  const removePhoto = useCallback((uri: string) => {
    setMediaItems((current) => current.filter((item) => item.uri !== uri));
  }, []);

  const pickPhotos = useCallback(async () => {
    await pickVisitMediaWithPremiumGate({
      currentCount: mediaItems.length,
      onPicked: (items) => {
        setMediaItems((current) => [...current, ...items].slice(0, isPremium ? undefined : FREE_PHOTO_LIMIT));
      },
      onError: (caught) => {
        Alert.alert(
          '写真や動画を追加できませんでした',
          caught instanceof Error ? caught.message : 'もう一度お試しください。',
        );
      },
    });
  }, [isPremium, mediaItems.length, pickVisitMediaWithPremiumGate]);

  const toggleMemo = useCallback((type: MemoType) => {
    setSelectedMemoTypes((current) =>
      current.includes(type) ? current.filter((item) => item !== type) : [...current, type],
    );
  }, []);

  const setMemoContent = useCallback((type: MemoType, content: string) => {
    setMemoContents((current) => ({ ...current, [type]: content }));
  }, []);

  const toggleDatePicker = useCallback(() => {
    setDatePickerOpen((prev) => !prev);
  }, []);

  const handleDateChange = useCallback(
    (_event: DateTimePickerEvent, next?: Date) => {
      if (!next) return;
      const iso = toISODate(next);
      if (iso !== visitedAt) {
        setVisitedAt(iso);
      }
      setDatePickerOpen(false);
    },
    [visitedAt],
  );

  const goNextFromDetails = useCallback(() => {
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
  }, [cityInput, cityNames, visitedAt]);

  const saveVisit = useCallback(async () => {
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

    if (!canSelectCountry(selectedCountry.id)) {
      showCountryLimitAlert();
      setStep(0);
      return;
    }

    setIsSaving(true);
    try {
      await addVisit({
        countryId: selectedCountry.id,
        visitedAt,
        cityNames,
        mediaItems,
        memos: selectedMemoTypes.map((type) => ({ type, content: memoContents[type] ?? '' })),
      });
      setStep(5);
    } catch (caught) {
      Alert.alert('保存できませんでした', caught instanceof Error ? caught.message : 'もう一度お試しください。');
    } finally {
      setIsSaving(false);
    }
  }, [
    addVisit,
    canSelectCountry,
    cityNames,
    memoContents,
    mediaItems,
    selectedCountry,
    selectedMemoTypes,
    showCountryLimitAlert,
    visitedAt,
  ]);

  const finish = useCallback(() => {
    if (selectedCountry) {
      router.replace({ pathname: '/country/[countryId]', params: { countryId: selectedCountry.id } });
      return;
    }
    router.replace('/');
  }, [router, selectedCountry]);

  const close = useCallback(() => {
    router.back();
  }, [router]);

  return {
    step,
    setStep,
    countryId,
    countryQuery,
    setCountryQuery,
    filter,
    setFilter,
    visitedAt,
    isDatePickerOpen,
    toggleDatePicker,
    handleDateChange,
    cityInput,
    setCityInput,
    cityNames,
    mediaItems,
    selectedMemoTypes,
    memoContents,
    isSaving,
    selectedCountry,
    isPremium,
    visitCountByCountry,
    countries,
    selectCountry,
    addCity,
    removeCity,
    pickPhotos,
    removePhoto,
    toggleMemo,
    setMemoContent,
    goNextFromDetails,
    saveVisit,
    finish,
    close,
  };
}

export type AddVisitFormApi = ReturnType<typeof useAddVisitForm>;
