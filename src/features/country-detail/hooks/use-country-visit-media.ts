import { useMemo, useState } from 'react';

import { COUNTRY_BY_ID } from '@/data';
import { getCountrySummary } from '@/features';
import { useTravel } from '@/hooks';
import type { Country, VisitBundle, VisitMedia } from '@/types';

import { useVisitMediaActions } from './use-visit-media-actions';

type UseCountryVisitMediaOptions = {
  countryId: string;
  visitId?: string | null;
};

export function useCountryVisitMedia({ countryId, visitId }: UseCountryVisitMediaOptions) {
  const { data } = useTravel();
  const country = COUNTRY_BY_ID[countryId] as Country | undefined;
  const summary = getCountrySummary(data, countryId);

  const resolvedVisitId =
    typeof visitId === 'string' ? visitId : summary?.visits[0]?.visit.id;

  const visitBundle = useMemo(
    () => summary?.visits.find((bundle) => bundle.visit.id === resolvedVisitId),
    [resolvedVisitId, summary],
  );

  const visitOrdinal = useMemo(() => {
    if (!summary || !visitBundle) return 1;
    return summary.visits.findIndex((bundle) => bundle.visit.id === visitBundle.visit.id) + 1;
  }, [summary, visitBundle]);

  const media: VisitMedia[] = visitBundle?.photos ?? [];

  const mediaActions = useVisitMediaActions({
    visitId: visitBundle?.visit.id,
    currentCount: media.length,
  });

  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  return {
    country,
    summary,
    visitBundle: visitBundle as VisitBundle | undefined,
    visitOrdinal,
    media,
    previewIndex,
    setPreviewIndex,
    mediaActions,
    isReady: Boolean(country && visitBundle),
  };
}
