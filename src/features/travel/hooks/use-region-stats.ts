import { useMemo } from 'react';

import { useTravel } from '@/hooks';

import { getRegionStats } from '../selectors/stats';

export function useRegionStats() {
  const { data } = useTravel();
  return useMemo(() => getRegionStats(data), [data]);
}
