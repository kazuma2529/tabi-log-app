import { nowISO } from '@/lib';

import { getDatabase } from './client';

export async function setPremiumForDevelopment(isPremium: boolean) {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE purchases SET is_premium = ?, updated_at = ? WHERE id = ?',
    isPremium ? 1 : 0,
    nowISO(),
    'local',
  );
}
