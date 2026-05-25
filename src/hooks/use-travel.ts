import { useContext } from 'react';

import { TravelContext } from '@/features/travel/travel-context';

export function useTravel() {
  const context = useContext(TravelContext);

  if (!context) {
    throw new Error('useTravel must be used inside TravelProvider');
  }

  return context;
}
