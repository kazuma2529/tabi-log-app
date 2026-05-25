import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

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
import type { AddVisitInput, City, MemoCard, MemoType, Photo, TravelData } from '@/types';

type TravelContextValue = {
  data: TravelData;
  isReady: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addVisit: (input: AddVisitInput) => Promise<string>;
  removeVisit: (visitId: string) => Promise<void>;
  updateVisitDate: (visitId: string, visitedAt: string) => Promise<void>;
  addCity: (visitId: string, name: string) => Promise<City | null>;
  removeCity: (cityId: string) => Promise<City | null>;
  restoreCity: (city: City) => Promise<void>;
  addPhotosToVisit: (visitId: string, uris: string[]) => Promise<Photo[]>;
  removePhoto: (photoId: string) => Promise<Photo | null>;
  restorePhoto: (photo: Photo) => Promise<void>;
  purgePhotoFile: (storedUri: string) => Promise<void>;
  addMemo: (visitId: string, type: MemoType, content?: string) => Promise<MemoCard>;
  updateMemoContent: (memoId: string, content: string) => Promise<void>;
  removeMemo: (memoId: string) => Promise<MemoCard | null>;
  restoreMemo: (memo: MemoCard) => Promise<void>;
  addBucketCountry: (countryId: string) => Promise<void>;
  removeBucketCountry: (countryId: string) => Promise<void>;
  addBucketMemo: (countryId: string, content: string) => Promise<void>;
  removeBucketMemo: (memoId: string) => Promise<void>;
  toggleBucketMemoDone: (memoId: string, isDone: boolean) => Promise<void>;
  setDevelopmentPremium: (isPremium: boolean) => Promise<void>;
};

const emptyData: TravelData = {
  visits: [],
  cities: [],
  photos: [],
  memoCards: [],
  bucketList: [],
  bucketMemos: [],
  purchase: {
    isPremium: false,
    entitlementId: null,
    updatedAt: new Date().toISOString(),
  },
};

export const TravelContext = createContext<TravelContextValue | null>(null);

export function TravelProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<TravelData>(emptyData);
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

  const addVisit = useCallback(
    async (input: AddVisitInput) => {
      const visitId = await addVisitToDb(input);
      await refresh();
      return visitId;
    },
    [refresh],
  );

  const removeVisit = useCallback(
    async (visitId: string) => {
      await removeVisitFromDb(visitId);
      await refresh();
    },
    [refresh],
  );

  const updateVisitDate = useCallback(
    async (visitId: string, visitedAt: string) => {
      await updateVisitDateInDb(visitId, visitedAt);
      await refresh();
    },
    [refresh],
  );

  const addCity = useCallback(
    async (visitId: string, name: string) => {
      const result = await addCityToDb(visitId, name);
      await refresh();
      return result;
    },
    [refresh],
  );

  const removeCity = useCallback(
    async (cityId: string) => {
      const removed = await removeCityFromDb(cityId);
      await refresh();
      return removed;
    },
    [refresh],
  );

  const restoreCity = useCallback(
    async (city: City) => {
      await restoreCityInDb(city);
      await refresh();
    },
    [refresh],
  );

  const addPhotosToVisit = useCallback(
    async (visitId: string, uris: string[]) => {
      const created = await addPhotosToVisitInDb(visitId, uris);
      await refresh();
      return created;
    },
    [refresh],
  );

  const removePhoto = useCallback(
    async (photoId: string) => {
      const removed = await removePhotoFromDb(photoId);
      await refresh();
      return removed;
    },
    [refresh],
  );

  const restorePhoto = useCallback(
    async (photo: Photo) => {
      await restorePhotoInDb(photo);
      await refresh();
    },
    [refresh],
  );

  const purgePhotoFile = useCallback(async (storedUri: string) => {
    await purgePhotoFileInDb(storedUri);
  }, []);

  const addMemo = useCallback(
    async (visitId: string, type: MemoType, content?: string) => {
      const created = await addMemoToDb(visitId, type, content);
      await refresh();
      return created;
    },
    [refresh],
  );

  const updateMemoContent = useCallback(
    async (memoId: string, content: string) => {
      await updateMemoContentInDb(memoId, content);
      await refresh();
    },
    [refresh],
  );

  const removeMemo = useCallback(
    async (memoId: string) => {
      const removed = await removeMemoFromDb(memoId);
      await refresh();
      return removed;
    },
    [refresh],
  );

  const restoreMemo = useCallback(
    async (memo: MemoCard) => {
      await restoreMemoInDb(memo);
      await refresh();
    },
    [refresh],
  );

  const addBucketCountry = useCallback(
    async (countryId: string) => {
      await addBucketCountryToDb(countryId);
      await refresh();
    },
    [refresh],
  );

  const removeBucketCountry = useCallback(
    async (countryId: string) => {
      await removeBucketCountryFromDb(countryId);
      await refresh();
    },
    [refresh],
  );

  const addBucketMemo = useCallback(
    async (countryId: string, content: string) => {
      await addBucketMemoToDb(countryId, content);
      await refresh();
    },
    [refresh],
  );

  const removeBucketMemo = useCallback(
    async (memoId: string) => {
      await removeBucketMemoFromDb(memoId);
      await refresh();
    },
    [refresh],
  );

  const toggleBucketMemoDone = useCallback(
    async (memoId: string, isDone: boolean) => {
      await setBucketMemoDoneInDb(memoId, isDone);
      await refresh();
    },
    [refresh],
  );

  const setDevelopmentPremium = useCallback(
    async (isPremium: boolean) => {
      await setPremiumForDevelopment(isPremium);
      await refresh();
    },
    [refresh],
  );

  const value = useMemo(
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
