import { useMemo } from 'react';

import { useTravel } from '@/hooks';

import { getDiarySections } from '../selectors/diary';

export function useDiarySections() {
  const { data } = useTravel();
  return useMemo(() => getDiarySections(data), [data]);
}
