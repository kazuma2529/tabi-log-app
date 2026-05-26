import { useTravel } from './use-travel';

export function usePremium() {
  const { data, setDevelopmentPremium } = useTravel();

  return {
    isPremium: data.purchase.isPremium,
    entitlementId: data.purchase.entitlementId,
    updatedAt: data.purchase.updatedAt,
    setDevelopmentPremium,
  };
}
