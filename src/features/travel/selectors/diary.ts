import { REGION_ORDER } from '@/data';
import type { TravelData } from '@/types';

import { getCountrySummaries } from './visit';

export function getDiarySections(data: TravelData) {
  const summaries = getCountrySummaries(data);

  return REGION_ORDER.map((region) => ({
    title: region,
    data: summaries
      .filter((summary) => summary.country.region === region)
      .sort((a, b) => b.lastVisitedAt.localeCompare(a.lastVisitedAt)),
  })).filter((section) => section.data.length > 0);
}
