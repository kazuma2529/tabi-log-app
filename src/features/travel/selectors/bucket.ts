import { COUNTRY_BY_ID } from '@/data';
import type { BucketMemo, Country, TravelData } from '@/types';

export function getBucketCountries(data: TravelData): Country[] {
  return data.bucketList
    .map((item) => COUNTRY_BY_ID[item.countryId])
    .filter((country): country is Country => Boolean(country));
}

export function isCountryInBucket(data: TravelData, countryId: string) {
  return data.bucketList.some((item) => item.countryId === countryId);
}

export function getBucketMemosByCountry(data: TravelData, countryId: string): BucketMemo[] {
  return data.bucketMemos.filter((memo) => memo.countryId === countryId);
}
