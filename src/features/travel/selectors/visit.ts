import { COUNTRY_BY_ID } from "@/data";
import { compareISODate } from "@/lib";
import type { CountrySummary, TravelData, VisitBundle } from "@/types";

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
      const sortedVisits = [...visits].sort((a, b) =>
        compareISODate(a.visit.visitedAt, b.visit.visitedAt),
      );
      const latest = sortedVisits[sortedVisits.length - 1];

      return {
        country: sortedVisits[0].country,
        visits: sortedVisits,
        lastVisitedAt: latest.visit.visitedAt,
        visitCount: sortedVisits.length,
      };
    })
    .sort((a, b) => {
      const dateDiff = b.lastVisitedAt.localeCompare(a.lastVisitedAt);
      if (dateDiff !== 0) return dateDiff;
      // 訪問日が同じ場合は、最新訪問の登録日時 (createdAt) が新しい国を先に出す。
      const aCreatedAt = a.visits[a.visits.length - 1].visit.createdAt;
      const bCreatedAt = b.visits[b.visits.length - 1].visit.createdAt;
      return bCreatedAt.localeCompare(aCreatedAt);
    });
}

export function getCountrySummary(data: TravelData, countryId: string) {
  return getCountrySummaries(data).find(
    (summary) => summary.country.id === countryId,
  );
}

export function getRecentCountries(data: TravelData, limit = 5) {
  return getCountrySummaries(data).slice(0, limit);
}

export function getMostVisitedCountry(data: TravelData) {
  const summaries = getCountrySummaries(data);
  return [...summaries].sort(
    (a, b) =>
      b.visitCount - a.visitCount ||
      b.lastVisitedAt.localeCompare(a.lastVisitedAt),
  )[0];
}

export function getLatestVisitedCountry(data: TravelData) {
  return getCountrySummaries(data)[0];
}
