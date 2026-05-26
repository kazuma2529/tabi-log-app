import { nowISO, resolvePhotoUri } from '@/lib';
import type { BucketListItem, BucketMemo, City, MemoCard, Photo, PurchaseState, TravelData, Visit } from '@/types';

import { applySchema, getDatabase } from './client';
import {
  ensurePurchaseRow,
  migratePhotoPathsToRelative,
  removeJapanLegacyData,
  seedCountries,
} from './migrations';

export async function initializeDatabase() {
  const db = await getDatabase();

  await applySchema(db);

  await seedCountries(db);
  await ensurePurchaseRow(db);
  await migratePhotoPathsToRelative(db);
  await removeJapanLegacyData(db);
}

export async function getTravelData(): Promise<TravelData> {
  const db = await getDatabase();

  const [visits, cities, photoRows, memoCards, bucketList, bucketMemoRows, purchaseRow] = await Promise.all([
    db.getAllAsync<Visit>(
      'SELECT id, country_id as countryId, visited_at as visitedAt, visit_order as visitOrder, created_at as createdAt, updated_at as updatedAt FROM visits ORDER BY visited_at ASC, created_at ASC',
    ),
    db.getAllAsync<City>(
      'SELECT id, visit_id as visitId, name, created_at as createdAt FROM cities ORDER BY created_at ASC',
    ),
    db.getAllAsync<Photo>(
      'SELECT id, visit_id as visitId, uri, created_at as createdAt FROM photos ORDER BY created_at ASC',
    ),
    db.getAllAsync<MemoCard>(
      'SELECT id, visit_id as visitId, type, content, created_at as createdAt, updated_at as updatedAt FROM memo_cards ORDER BY created_at ASC',
    ),
    db.getAllAsync<BucketListItem>(
      'SELECT id, country_id as countryId, created_at as createdAt FROM bucket_list ORDER BY created_at ASC',
    ),
    db.getAllAsync<{ id: string; countryId: string; content: string; isDone: number; createdAt: string; updatedAt: string }>(
      'SELECT id, country_id as countryId, content, is_done as isDone, created_at as createdAt, updated_at as updatedAt FROM bucket_memos ORDER BY created_at ASC',
    ),
    db.getFirstAsync<{ isPremium: number; entitlementId: string | null; updatedAt: string }>(
      'SELECT is_premium as isPremium, entitlement_id as entitlementId, updated_at as updatedAt FROM purchases WHERE id = ?',
      'local',
    ),
  ]);

  const purchase: PurchaseState = {
    isPremium: Boolean(purchaseRow?.isPremium),
    entitlementId: purchaseRow?.entitlementId ?? null,
    updatedAt: purchaseRow?.updatedAt ?? nowISO(),
  };

  const bucketMemos: BucketMemo[] = bucketMemoRows.map((row) => ({
    id: row.id,
    countryId: row.countryId,
    content: row.content,
    isDone: Boolean(row.isDone),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }));

  // DB に保存されているのは相対パス（visit-photos/xxx）想定だが、
  // 表示側では現在の documentDirectory に解決した絶対 URI を返す。
  const photos: Photo[] = photoRows.map((row) => ({
    ...row,
    uri: resolvePhotoUri(row.uri),
  }));

  return {
    visits,
    cities,
    photos,
    memoCards,
    bucketList,
    bucketMemos,
    purchase,
  };
}
