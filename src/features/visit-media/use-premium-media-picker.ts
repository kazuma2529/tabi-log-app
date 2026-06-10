import { useCallback, useEffect, useRef, useState } from 'react';

import { usePremium, usePremiumActions } from '@/hooks';
import { pickAndStoreVisitMedia } from '@/lib';
import type { StoredVisitMediaInput } from '@/types';

import { showPremiumMediaAlert } from './show-premium-media-alert';

const PROCESSING_INDICATOR_DELAY_MS = 900;

type PickVisitMediaWithPremiumGateOptions = {
  currentCount: number;
  onPicked: (items: StoredVisitMediaInput[]) => void | Promise<void>;
  onError?: (error: unknown) => void;
};

export function usePremiumMediaPicker() {
  const { isPremium } = usePremium();
  const { purchasePremiumWithFeedback } = usePremiumActions();
  const [isProcessingMedia, setProcessingMedia] = useState(false);
  const indicatorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearIndicatorTimer = useCallback(() => {
    if (indicatorTimerRef.current) {
      clearTimeout(indicatorTimerRef.current);
      indicatorTimerRef.current = null;
    }
  }, []);

  const hideProcessingIndicator = useCallback(() => {
    clearIndicatorTimer();
    setProcessingMedia(false);
  }, [clearIndicatorTimer]);

  useEffect(() => clearIndicatorTimer, [clearIndicatorTimer]);

  const pickVisitMediaWithPremiumGate = useCallback(
    async ({ currentCount, onPicked, onError }: PickVisitMediaWithPremiumGateOptions) => {
      indicatorTimerRef.current = setTimeout(() => {
        indicatorTimerRef.current = null;
        setProcessingMedia(true);
      }, PROCESSING_INDICATOR_DELAY_MS);

      try {
        const result = await pickAndStoreVisitMedia(currentCount, isPremium);
        if (result.limitReached) {
          showPremiumMediaAlert({
            onUpgrade: purchasePremiumWithFeedback,
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
      } finally {
        hideProcessingIndicator();
      }
    },
    [hideProcessingIndicator, isPremium, purchasePremiumWithFeedback],
  );

  return { pickVisitMediaWithPremiumGate, isProcessingMedia };
}
