import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

import {
  addBucketCountry as addBucketCountryToDb,
  addBucketMemo as addBucketMemoToDb,
  addCity as addCityToDb,
  addMemo as addMemoToDb,
  addMediaToVisit as addMediaToVisitInDb,
  moveVisitMediaToFront as moveVisitMediaToFrontInDb,
  reorderVisitMedia as reorderVisitMediaInDb,
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
  setPremiumFromRevenueCat,
  updateMemoContent as updateMemoContentInDb,
  updateVisitDate as updateVisitDateInDb,
} from '@/db';
import {
  getRevenueCatPremiumState,
  hasRevenueCatApiKey,
  PREMIUM_COUNTRY_LIMIT_ERROR_MESSAGE,
  purchaseRevenueCatPremium,
  restoreRevenueCatPremium,
} from '@/lib';
import type { AddVisitInput, TravelData } from '@/types';

import { canRegisterVisitCountry } from './selectors';
import { useRefreshingMutation } from './hooks/create-refreshing-mutation';
import { TravelContext, emptyTravelData, type TravelContextValue } from './travel-context';

export function TravelProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<TravelData>(emptyTravelData);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const nextData = await getTravelData();
    setData(nextData);
    setError(null);
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

        if (hasRevenueCatApiKey()) {
          try {
            await setPremiumFromRevenueCat(await getRevenueCatPremiumState());
            const syncedData = await getTravelData();
            if (mounted) {
              setData(syncedData);
            }
          } catch {
            // 通信失敗時は先に表示した SQLite の最終状態を維持する。
          }
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

  const addVisit = useCallback(
    async (input: AddVisitInput) => {
      if (!canRegisterVisitCountry(data, input.countryId, data.purchase.isPremium)) {
        throw new Error(PREMIUM_COUNTRY_LIMIT_ERROR_MESSAGE);
      }

      const visitId = await addVisitToDb(input);
      await refresh();
      return visitId;
    },
    [data, refresh],
  );
  const removeVisit = useRefreshingMutation(removeVisitFromDb, refresh);
  const updateVisitDate = useRefreshingMutation(updateVisitDateInDb, refresh);
  const addCity = useRefreshingMutation(addCityToDb, refresh);
  const removeCity = useRefreshingMutation(removeCityFromDb, refresh);
  const restoreCity = useRefreshingMutation(restoreCityInDb, refresh);
  const addMediaToVisit = useRefreshingMutation(addMediaToVisitInDb, refresh);
  const reorderVisitMedia = useRefreshingMutation(reorderVisitMediaInDb, refresh);
  const moveVisitMediaToFront = useRefreshingMutation(moveVisitMediaToFrontInDb, refresh);
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

  const runPremiumAction = useCallback(
    async (action: () => Promise<boolean>) => {
      const isPremium = await action();
      await setPremiumFromRevenueCat(isPremium);
      await refresh();
      return isPremium;
    },
    [refresh],
  );
  const purchasePremium = useCallback(
    () => runPremiumAction(purchaseRevenueCatPremium),
    [runPremiumAction],
  );
  const restorePremium = useCallback(
    () => runPremiumAction(restoreRevenueCatPremium),
    [runPremiumAction],
  );

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
      addMediaToVisit,
      reorderVisitMedia,
      moveVisitMediaToFront,
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
      purchasePremium,
      restorePremium,
    }),
    [
      addBucketCountry,
      addBucketMemo,
      addCity,
      addMemo,
      addMediaToVisit,
      addVisit,
      data,
      error,
      isReady,
      purgePhotoFile,
      purchasePremium,
      refresh,
      removeBucketCountry,
      removeBucketMemo,
      removeCity,
      removeMemo,
      moveVisitMediaToFront,
      removePhoto,
      removeVisit,
      reorderVisitMedia,
      restoreCity,
      restoreMemo,
      restorePhoto,
      restorePremium,
      toggleBucketMemoDone,
      updateMemoContent,
      updateVisitDate,
    ],
  );

  return <TravelContext.Provider value={value}>{children}</TravelContext.Provider>;
}
