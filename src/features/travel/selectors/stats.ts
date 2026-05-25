import { REGION_COLORS, REGION_TARGETS, TOTAL_TARGET_COUNTRIES } from '@/constants';
import { COUNTRIES, REGION_ORDER } from '@/data';
import type { TravelData } from '@/types';

import { getVisitedCountryCount, getVisitedCountryIds } from './map';

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
