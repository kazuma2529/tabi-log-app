import { createId, deletePhotoFiles, nowISO, toRelativePhotoPath } from '@/lib';
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

  for (const uri of input.photoUris.filter(Boolean)) {
    await db.runAsync(
      'INSERT INTO photos (id, visit_id, uri, created_at) VALUES (?, ?, ?, ?)',
      createId('photo'),
      visitId,
      toRelativePhotoPath(uri),
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
