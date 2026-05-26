import { createContext } from 'react';

import type { AddVisitInput, City, MemoCard, MemoType, Photo, TravelData } from '@/types';

export type TravelContextValue = {
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

export const TravelContext = createContext<TravelContextValue | null>(null);

export const emptyTravelData: TravelData = {
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
