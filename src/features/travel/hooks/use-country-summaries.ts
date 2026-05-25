import { useMemo } from 'react';

import { useTravel } from '@/hooks';

import { getCountrySummaries } from '../selectors/visit';

/**
 * getCountrySummaries は visits / cities / photos / memoCards を全件走査するため、
 * 同一 render で複数の selector から呼ばれると同じ計算を繰り返してしまう。
 * useTravel().data 単位で結果を memo 化することで、screen ごとに 1 回に揃える。
 */
export function useCountrySummaries() {
  const { data } = useTravel();
  return useMemo(() => getCountrySummaries(data), [data]);
}
