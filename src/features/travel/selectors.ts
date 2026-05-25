import { REGION_COLORS, REGION_TARGETS, TOTAL_TARGET_COUNTRIES } from '@/constants';
import { COUNTRIES, COUNTRY_BY_ID, REGION_ORDER } from '@/data';
import { compareISODate } from '@/lib';
import type { BucketMemo, Country, CountrySummary, TravelData, VisitBundle } from '@/types';

export function getVisitBundles(data: TravelData): VisitBundle[] {
  return data.visits
    .map((visit) => {
      const country = COUNTRY_BY_ID[visit.countryId];

      if (!country) {
        return null;
      }

      return {
        visit,
        country,
        cities: data.cities.filter((city) => city.visitId === visit.id),
        photos: data.photos.filter((photo) => photo.visitId === visit.id),
        memos: data.memoCards.filter((memo) => memo.visitId === visit.id),
      };
    })
    .filter((bundle): bundle is VisitBundle => Boolean(bundle));
}

export function getCountrySummaries(data: TravelData): CountrySummary[] {
  const grouped = new Map<string, VisitBundle[]>();

  for (const bundle of getVisitBundles(data)) {
    const bundles = grouped.get(bundle.country.id) ?? [];
    bundles.push(bundle);
    grouped.set(bundle.country.id, bundles);
  }

  return [...grouped.values()]
    .map((visits) => {
      const sortedVisits = [...visits].sort((a, b) => compareISODate(a.visit.visitedAt, b.visit.visitedAt));
      const latest = sortedVisits[sortedVisits.length - 1];

      return {
        country: sortedVisits[0].country,
        visits: sortedVisits,
        lastVisitedAt: latest.visit.visitedAt,
        visitCount: sortedVisits.length,
      };
    })
    .sort((a, b) => b.lastVisitedAt.localeCompare(a.lastVisitedAt));
}

export function getCountrySummary(data: TravelData, countryId: string) {
  return getCountrySummaries(data).find((summary) => summary.country.id === countryId);
}

export function getVisitedCountryIds(data: TravelData) {
  return new Set(data.visits.map((visit) => visit.countryId));
}

export function getVisitedCountryCount(data: TravelData) {
  return getVisitedCountryIds(data).size;
}

export function getWorldProgress(data: TravelData) {
  const visited = getVisitedCountryCount(data);
  return {
    visited,
    total: TOTAL_TARGET_COUNTRIES,
    percentage: Number(((visited / TOTAL_TARGET_COUNTRIES) * 100).toFixed(1)),
  };
}

export function getRecentCountries(data: TravelData, limit = 5) {
  return getCountrySummaries(data).slice(0, limit);
}

export function getMostVisitedCountry(data: TravelData) {
  const summaries = getCountrySummaries(data);
  return [...summaries].sort((a, b) => b.visitCount - a.visitCount || b.lastVisitedAt.localeCompare(a.lastVisitedAt))[0];
}

export function getLatestVisitedCountry(data: TravelData) {
  return getCountrySummaries(data)[0];
}

export function getBucketCountries(data: TravelData): Country[] {
  return data.bucketList.map((item) => COUNTRY_BY_ID[item.countryId]).filter((country): country is Country => Boolean(country));
}

export function isCountryInBucket(data: TravelData, countryId: string) {
  return data.bucketList.some((item) => item.countryId === countryId);
}

export function getBucketMemosByCountry(data: TravelData, countryId: string): BucketMemo[] {
  return data.bucketMemos.filter((memo) => memo.countryId === countryId);
}

export function getDiarySections(data: TravelData) {
  const summaries = getCountrySummaries(data);

  return REGION_ORDER.map((region) => ({
    title: region,
    data: summaries
      .filter((summary) => summary.country.region === region)
      .sort((a, b) => b.lastVisitedAt.localeCompare(a.lastVisitedAt)),
  })).filter((section) => section.data.length > 0);
}

export function getRegionStats(data: TravelData) {
  const visitedIds = getVisitedCountryIds(data);

  return REGION_ORDER.map((region) => {
    const visited = COUNTRIES.filter((country) => country.region === region && visitedIds.has(country.id)).length;
    const total = REGION_TARGETS[region];

    return {
      region,
      visited,
      total,
      percentage: Number(((visited / total) * 100).toFixed(1)),
      color: REGION_COLORS[region],
    };
  });
}

export function getMapCountries() {
  return COUNTRIES;
}

export function getVisitsByYear(data: TravelData) {
  const byYear = new Map<number, number>();

  for (const visit of data.visits) {
    const year = Number(visit.visitedAt.slice(0, 4));
    if (Number.isFinite(year)) {
      byYear.set(year, (byYear.get(year) ?? 0) + 1);
    }
  }

  return [...byYear.entries()]
    .map(([year, visits]) => ({ year, visits }))
    .sort((a, b) => a.year - b.year);
}
