import { useMemo } from 'react';

import { useTravel } from '@/hooks';

import { getBucketCountries } from '../selectors/bucket';

export function useBucketCountries() {
  const { data } = useTravel();
  return useMemo(() => getBucketCountries(data), [data]);
}
