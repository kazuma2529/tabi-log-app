import { FREE_VISITED_COUNTRY_LIMIT } from '@/constants';
import {
  createId,
  deletePhotoFiles,
  nowISO,
  PREMIUM_COUNTRY_LIMIT_ERROR_MESSAGE,
  toRelativeMediaPath,
} from '@/lib';
import type { AddVisitInput } from '@/types';

import { getDatabase } from './client';

export async function addVisit(input: AddVisitInput) {
  const db = await getDatabase();
  const timestamp = nowISO();
  const visitId = createId('visit');
  const count = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM visits WHERE country_id = ?',
    input.countryId,
  );
  const visitOrder = (count?.count ?? 0) + 1;

  if (visitOrder === 1) {
    const purchase = await db.getFirstAsync<{ isPremium: number }>(
      'SELECT is_premium as isPremium FROM purchases WHERE id = ?',
      'local',
    );
    const visitedCountryCount = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(DISTINCT country_id) as count FROM visits',
    );

    if (!purchase?.isPremium && (visitedCountryCount?.count ?? 0) >= FREE_VISITED_COUNTRY_LIMIT) {
      throw new Error(PREMIUM_COUNTRY_LIMIT_ERROR_MESSAGE);
    }
  }

  await db.runAsync(
    'INSERT INTO visits (id, country_id, visited_at, visit_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
    visitId,
    input.countryId,
    input.visitedAt,
    visitOrder,
    timestamp,
    timestamp,
  );

  for (const cityName of input.cityNames.filter(Boolean)) {
    await db.runAsync(
      'INSERT INTO cities (id, visit_id, name, created_at) VALUES (?, ?, ?, ?)',
      createId('city'),
      visitId,
      cityName,
      timestamp,
    );
  }

  for (const [index, item] of input.mediaItems.filter((media) => Boolean(media.uri)).entries()) {
    await db.runAsync(
      `INSERT INTO photos (
        id, visit_id, uri, media_type, thumbnail_uri, sort_order, width, height, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      createId('photo'),
      visitId,
      toRelativeMediaPath(item.uri),
      item.mediaType,
      item.thumbnailUri ? toRelativeMediaPath(item.thumbnailUri) : null,
      index,
      item.width ?? null,
      item.height ?? null,
      timestamp,
    );
  }

  for (const memo of input.memos.filter((item) => item.content.trim().length > 0)) {
    await db.runAsync(
      'INSERT INTO memo_cards (id, visit_id, type, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      createId('memo'),
      visitId,
      memo.type,
      memo.content.trim(),
      timestamp,
      timestamp,
    );
  }

  await db.runAsync('DELETE FROM bucket_list WHERE country_id = ?', input.countryId);

  return visitId;
}

export async function updateVisitDate(visitId: string, visitedAt: string) {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE visits SET visited_at = ?, updated_at = ? WHERE id = ?',
    visitedAt,
    nowISO(),
    visitId,
  );
}

export async function removeVisit(visitId: string) {
  const db = await getDatabase();

  const photoRows = await db.getAllAsync<{ uri: string }>(
    'SELECT uri FROM photos WHERE visit_id = ?',
    visitId,
  );

  // CASCADE で cities / photos / memo_cards も同時に削除される。
  await db.runAsync('DELETE FROM visits WHERE id = ?', visitId);

  if (photoRows.length > 0) {
    await deletePhotoFiles(photoRows.map((row) => row.uri));
  }
}
