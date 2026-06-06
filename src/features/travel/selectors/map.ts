import { FREE_VISITED_COUNTRY_LIMIT } from '@/constants';
import { COUNTRIES } from '@/data';
import type { TravelData } from '@/types';

export function getVisitedCountryIds(data: TravelData) {
  return new Set(data.visits.map((visit) => visit.countryId));
}

export function getVisitedCountryCount(data: TravelData) {
  return getVisitedCountryIds(data).size;
}

export function canRegisterVisitCountry(data: TravelData, countryId: string, isPremium: boolean) {
  const visitedIds = getVisitedCountryIds(data);

  return isPremium || visitedIds.has(countryId) || visitedIds.size < FREE_VISITED_COUNTRY_LIMIT;
}

export function getMapCountries() {
  return COUNTRIES;
}
