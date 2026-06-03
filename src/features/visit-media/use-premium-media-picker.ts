import { useCallback } from 'react';

import { usePremium } from '@/hooks';
import { pickAndStoreVisitMedia } from '@/lib';
import type { StoredVisitMediaInput } from '@/types';

import { showPremiumMediaAlert, showPremiumPendingAfterUpgrade } from './show-premium-media-alert';

type PickVisitMediaWithPremiumGateOptions = {
  currentCount: number;
  onPicked: (items: StoredVisitMediaInput[]) => void | Promise<void>;
  onError?: (error: unknown) => void;
};

export function usePremiumMediaPicker() {
  const { isPremium, setDevelopmentPremium } = usePremium();

  const pickVisitMediaWithPremiumGate = useCallback(
    async ({ currentCount, onPicked, onError }: PickVisitMediaWithPremiumGateOptions) => {
      try {
        const result = await pickAndStoreVisitMedia(currentCount, isPremium);
        if (result.limitReached) {
          showPremiumMediaAlert({
            onUpgrade: async () => {
              await setDevelopmentPremium(true);
              showPremiumPendingAfterUpgrade();
            },
          });
          return;
        }
        if (result.items.length === 0) return;
        await onPicked(result.items);
      } catch (error) {
        if (onError) {
          onError(error);
          return;
        }
        throw error;
      }
    },
    [isPremium, setDevelopmentPremium],
  );

  return { pickVisitMediaWithPremiumGate, isPremium };
}
