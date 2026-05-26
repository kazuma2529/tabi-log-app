import { createId, nowISO } from '@/lib';

import { getDatabase } from './client';

export async function addBucketCountry(countryId: string) {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT OR IGNORE INTO bucket_list (id, country_id, created_at) VALUES (?, ?, ?)',
    createId('bucket'),
    countryId,
    nowISO(),
  );
}

export async function removeBucketCountry(countryId: string) {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM bucket_list WHERE country_id = ?', countryId);
  await db.runAsync('DELETE FROM bucket_memos WHERE country_id = ?', countryId);
}

export async function addBucketMemo(countryId: string, content: string) {
  const trimmed = content.trim();
  if (trimmed.length === 0) {
    return null;
  }
  const db = await getDatabase();
  const id = createId('bmemo');
  const timestamp = nowISO();
  await db.runAsync(
    'INSERT INTO bucket_memos (id, country_id, content, is_done, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
    id,
    countryId,
    trimmed,
    0,
    timestamp,
    timestamp,
  );
  return id;
}

export async function removeBucketMemo(memoId: string) {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM bucket_memos WHERE id = ?', memoId);
}

export async function setBucketMemoDone(memoId: string, isDone: boolean) {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE bucket_memos SET is_done = ?, updated_at = ? WHERE id = ?',
    isDone ? 1 : 0,
    nowISO(),
    memoId,
  );
}
