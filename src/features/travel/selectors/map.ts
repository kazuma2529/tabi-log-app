import { COUNTRIES } from '@/data';
import type { TravelData } from '@/types';

export function getVisitedCountryIds(data: TravelData) {
  return new Set(data.visits.map((visit) => visit.countryId));
}

export function getVisitedCountryCount(data: TravelData) {
  return getVisitedCountryIds(data).size;
}

export function getMapCountries() {
  return COUNTRIES;
}
