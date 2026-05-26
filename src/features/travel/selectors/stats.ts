import { REGION_COLORS, REGION_TARGETS, TOTAL_TARGET_COUNTRIES } from '@/constants';
import { COUNTRIES, REGION_ORDER } from '@/data';
import { compareISODate, getYear } from '@/lib';
import type { Country, TravelData, VisitBundle } from '@/types';

import { getVisitedCountryCount, getVisitedCountryIds } from './map';
import { getVisitBundles } from './visit';

export type YearlyCountryVisitSummary = {
  country: Country;
  visits: VisitBundle[];
  firstVisitedAtInYear: string;
  lastVisitedAtInYear: string;
  isNewCountry: boolean;
};

export type YearlyTravelSummary = {
  year: number;
  visitCount: number;
  countryCount: number;
  newCountryCount: number;
  countries: YearlyCountryVisitSummary[];
  newCountries: YearlyCountryVisitSummary[];
};

export function getWorldProgress(data: TravelData) {
  const visited = getVisitedCountryCount(data);
  return {
    visited,
    total: TOTAL_TARGET_COUNTRIES,
    percentage: Number(((visited / TOTAL_TARGET_COUNTRIES) * 100).toFixed(1)),
  };
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

export function getVisitsByYear(data: TravelData) {
  return getYearlyTravelSummaries(data).map((summary) => ({
    year: summary.year,
    visits: summary.visitCount,
  }));
}

export function getYearlyTravelSummaries(data: TravelData): YearlyTravelSummary[] {
  const bundles = getVisitBundles(data).sort(compareVisitBundles);
  const firstVisitByCountry = new Map<string, VisitBundle>();
  const visitsByYearAndCountry = new Map<number, Map<string, VisitBundle[]>>();

  for (const bundle of bundles) {
    if (!firstVisitByCountry.has(bundle.country.id)) {
      firstVisitByCountry.set(bundle.country.id, bundle);
    }

    const year = getYear(bundle.visit.visitedAt);
    const countryMap = visitsByYearAndCountry.get(year) ?? new Map<string, VisitBundle[]>();
    const countryVisits = countryMap.get(bundle.country.id) ?? [];
    countryVisits.push(bundle);
    countryMap.set(bundle.country.id, countryVisits);
    visitsByYearAndCountry.set(year, countryMap);
  }

  return [...visitsByYearAndCountry.entries()]
    .map(([year, countryMap]) => {
      const countries = [...countryMap.entries()]
        .map(([countryId, countryVisits]) => {
          const visits = [...countryVisits].sort(compareVisitBundles);
          const firstVisit = visits[0];
          const lastVisit = visits[visits.length - 1];
          const firstEverVisit = firstVisitByCountry.get(countryId);
          const isNewCountry = firstEverVisit ? getYear(firstEverVisit.visit.visitedAt) === year : false;

          return {
            country: firstVisit.country,
            visits,
            firstVisitedAtInYear: firstVisit.visit.visitedAt,
            lastVisitedAtInYear: lastVisit.visit.visitedAt,
            isNewCountry,
          };
        })
        .sort(compareYearlyCountrySummaries);
      const newCountries = countries.filter((country) => country.isNewCountry);

      return {
        year,
        visitCount: countries.reduce((sum, country) => sum + country.visits.length, 0),
        countryCount: countries.length,
        newCountryCount: newCountries.length,
        countries,
        newCountries,
      };
    })
    .sort((a, b) => a.year - b.year);
}

function compareVisitBundles(a: VisitBundle, b: VisitBundle) {
  const dateDiff = compareISODate(a.visit.visitedAt, b.visit.visitedAt);
  if (dateDiff !== 0) {
    return dateDiff;
  }
  return a.visit.createdAt.localeCompare(b.visit.createdAt);
}

function compareYearlyCountrySummaries(a: YearlyCountryVisitSummary, b: YearlyCountryVisitSummary) {
  const dateDiff = compareISODate(a.firstVisitedAtInYear, b.firstVisitedAtInYear);
  if (dateDiff !== 0) {
    return dateDiff;
  }
  return a.country.nameJa.localeCompare(b.country.nameJa, 'ja');
}

export function getYearlyTravelSummary(data: TravelData, year: number) {
  return getYearlyTravelSummaries(data).find((summary) => summary.year === year);
}
