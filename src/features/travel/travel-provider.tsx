import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

import {
  addBucketCountry as addBucketCountryToDb,
  addBucketMemo as addBucketMemoToDb,
  addCity as addCityToDb,
  addMemo as addMemoToDb,
  addPhotosToVisit as addPhotosToVisitInDb,
  addVisit as addVisitToDb,
  getTravelData,
  initializeDatabase,
  purgePhotoFile as purgePhotoFileInDb,
  removeBucketCountry as removeBucketCountryFromDb,
  removeBucketMemo as removeBucketMemoFromDb,
  removeCity as removeCityFromDb,
  removeMemo as removeMemoFromDb,
  removePhoto as removePhotoFromDb,
  removeVisit as removeVisitFromDb,
  restoreCity as restoreCityInDb,
  restoreMemo as restoreMemoInDb,
  restorePhoto as restorePhotoInDb,
  setBucketMemoDone as setBucketMemoDoneInDb,
  setPremiumForDevelopment,
  updateMemoContent as updateMemoContentInDb,
  updateVisitDate as updateVisitDateInDb,
} from '@/db';
import type { TravelData } from '@/types';

import { useRefreshingMutation } from './hooks/create-refreshing-mutation';
import { TravelContext, emptyTravelData, type TravelContextValue } from './travel-context';

export function TravelProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<TravelData>(emptyTravelData);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const nextData = await getTravelData();
    setData(nextData);
  }, []);

  useEffect(() => {
    let mounted = true;

    async function boot() {
      try {
        await initializeDatabase();
        const nextData = await getTravelData();

        if (mounted) {
          setData(nextData);
          setIsReady(true);
        }
      } catch (caught) {
        if (mounted) {
          setError(caught instanceof Error ? caught.message : 'データベースの準備に失敗しました。');
          setIsReady(true);
        }
      }
    }

    boot();

    return () => {
      mounted = false;
    };
  }, []);

  const addVisit = useRefreshingMutation(addVisitToDb, refresh);
  const removeVisit = useRefreshingMutation(removeVisitFromDb, refresh);
  const updateVisitDate = useRefreshingMutation(updateVisitDateInDb, refresh);
  const addCity = useRefreshingMutation(addCityToDb, refresh);
  const removeCity = useRefreshingMutation(removeCityFromDb, refresh);
  const restoreCity = useRefreshingMutation(restoreCityInDb, refresh);
  const addPhotosToVisit = useRefreshingMutation(addPhotosToVisitInDb, refresh);
  const removePhoto = useRefreshingMutation(removePhotoFromDb, refresh);
  const restorePhoto = useRefreshingMutation(restorePhotoInDb, refresh);
  const addMemo = useRefreshingMutation(addMemoToDb, refresh);
  const updateMemoContent = useRefreshingMutation(updateMemoContentInDb, refresh);
  const removeMemo = useRefreshingMutation(removeMemoFromDb, refresh);
  const restoreMemo = useRefreshingMutation(restoreMemoInDb, refresh);
  const addBucketCountry = useRefreshingMutation(addBucketCountryToDb, refresh);
  const removeBucketCountry = useRefreshingMutation(removeBucketCountryFromDb, refresh);
  // DB は新規追加 memo の id を返すが、公開 API は Promise<void> なので戻り値を捨てる。
  const addBucketMemo = useCallback(
    async (countryId: string, content: string) => {
      await addBucketMemoToDb(countryId, content);
      await refresh();
    },
    [refresh],
  );
  const removeBucketMemo = useRefreshingMutation(removeBucketMemoFromDb, refresh);
  const toggleBucketMemoDone = useRefreshingMutation(setBucketMemoDoneInDb, refresh);
  const setDevelopmentPremium = useRefreshingMutation(setPremiumForDevelopment, refresh);

  // purgePhotoFile はファイルシステム掃除専用で、TravelData の再取得は不要なので
  // useRefreshingMutation には乗せない。
  const purgePhotoFile = useCallback(async (storedUri: string) => {
    await purgePhotoFileInDb(storedUri);
  }, []);

  const value = useMemo<TravelContextValue>(
    () => ({
      data,
      isReady,
      error,
      refresh,
      addVisit,
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
      addBucketCountry,
      removeBucketCountry,
      addBucketMemo,
      removeBucketMemo,
      toggleBucketMemoDone,
      setDevelopmentPremium,
    }),
    [
      addBucketCountry,
      addBucketMemo,
      addCity,
      addMemo,
      addPhotosToVisit,
      addVisit,
      data,
      error,
      isReady,
      purgePhotoFile,
      refresh,
      removeBucketCountry,
      removeBucketMemo,
      removeCity,
      removeMemo,
      removePhoto,
      removeVisit,
      restoreCity,
      restoreMemo,
      restorePhoto,
      setDevelopmentPremium,
      toggleBucketMemoDone,
      updateMemoContent,
      updateVisitDate,
    ],
  );

  return <TravelContext.Provider value={value}>{children}</TravelContext.Provider>;
}
