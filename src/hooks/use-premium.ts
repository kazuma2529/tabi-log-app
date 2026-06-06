import { useTravel } from './use-travel';

export function usePremium() {
  const { data, purchasePremium, restorePremium } = useTravel();

  return {
    isPremium: data.purchase.isPremium,
    entitlementId: data.purchase.entitlementId,
    updatedAt: data.purchase.updatedAt,
    purchasePremium,
    restorePremium,
  };
}
