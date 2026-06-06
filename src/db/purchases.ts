import { nowISO, PREMIUM_ENTITLEMENT_ID } from '@/lib';

import { getDatabase } from './client';

export async function setPremiumFromRevenueCat(isPremium: boolean) {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE purchases SET is_premium = ?, entitlement_id = ?, updated_at = ? WHERE id = ?',
    isPremium ? 1 : 0,
    isPremium ? PREMIUM_ENTITLEMENT_ID : null,
    nowISO(),
    'local',
  );
}
