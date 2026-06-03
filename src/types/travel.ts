export type Region = 'アジア' | 'ヨーロッパ' | '北米' | '南米' | 'アフリカ' | 'オセアニア';

export type Country = {
  id: string;
  isoCode: string;
  nameJa: string;
  nameEn: string;
  flag: string;
  region: Region;
  continent: Region;
  mapX: number;
  mapY: number;
  accent: string;
};

export type Visit = {
  id: string;
  countryId: string;
  visitedAt: string;
  visitOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type City = {
  id: string;
  visitId: string;
  name: string;
  createdAt: string;
};

export type MediaType = 'image' | 'video';

export type VisitMedia = {
  id: string;
  visitId: string;
  uri: string;
  mediaType: MediaType;
  thumbnailUri: string | null;
  sortOrder: number;
  width: number | null;
  height: number | null;
  createdAt: string;
};

/** @deprecated Use VisitMedia */
export type Photo = VisitMedia;

export type MemoType =
  | 'learned'
  | 'food'
  | 'culture_shock'
  | 'free_note'
  | 'people'
  | 'next_time';

export type MemoCard = {
  id: string;
  visitId: string;
  type: MemoType;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type BucketListItem = {
  id: string;
  countryId: string;
  createdAt: string;
};

export type BucketMemo = {
  id: string;
  countryId: string;
  content: string;
  isDone: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PurchaseState = {
  isPremium: boolean;
  entitlementId: string | null;
  updatedAt: string;
};

export type TravelData = {
  visits: Visit[];
  cities: City[];
  photos: VisitMedia[];
  memoCards: MemoCard[];
  bucketList: BucketListItem[];
  bucketMemos: BucketMemo[];
  purchase: PurchaseState;
};

export type StoredVisitMediaInput = {
  uri: string;
  mediaType: MediaType;
  thumbnailUri?: string;
  width?: number;
  height?: number;
};

export type AddVisitInput = {
  countryId: string;
  visitedAt: string;
  cityNames: string[];
  photoUris: string[];
  memos: {
    type: MemoType;
    content: string;
  }[];
};

export type VisitBundle = {
  visit: Visit;
  country: Country;
  cities: City[];
  photos: VisitMedia[];
  memos: MemoCard[];
};

export type CountrySummary = {
  country: Country;
  visits: VisitBundle[];
  lastVisitedAt: string;
  visitCount: number;
};
