import { createId, deletePhotoFiles, nowISO, resolvePhotoUri, toRelativePhotoPath } from '@/lib';
import type { Photo } from '@/types';

import { getDatabase } from './client';

export async function addPhotosToVisit(visitId: string, uris: string[]): Promise<Photo[]> {
  if (uris.length === 0) return [];
  const db = await getDatabase();
  const createdAt = nowISO();
  const inserted: Photo[] = [];

  for (const rawUri of uris.filter(Boolean)) {
    const id = createId('photo');
    const relative = toRelativePhotoPath(rawUri);
    await db.runAsync(
      'INSERT INTO photos (id, visit_id, uri, created_at) VALUES (?, ?, ?, ?)',
      id,
      visitId,
      relative,
      createdAt,
    );
    inserted.push({ id, visitId, uri: resolvePhotoUri(relative), createdAt });
  }

  return inserted;
}

export async function removePhoto(photoId: string): Promise<Photo | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ id: string; visitId: string; uri: string; createdAt: string }>(
    'SELECT id, visit_id as visitId, uri, created_at as createdAt FROM photos WHERE id = ?',
    photoId,
  );
  if (!row) return null;
  await db.runAsync('DELETE FROM photos WHERE id = ?', photoId);
  // 物理ファイルは Undo の猶予のためここでは消さず、purgePhotoFile で消す。
  return { ...row, uri: resolvePhotoUri(row.uri) };
}

export async function restorePhoto(photo: Photo) {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT OR REPLACE INTO photos (id, visit_id, uri, created_at) VALUES (?, ?, ?, ?)',
    photo.id,
    photo.visitId,
    toRelativePhotoPath(photo.uri),
    photo.createdAt,
  );
}

export async function purgePhotoFile(storedUri: string) {
  await deletePhotoFiles([storedUri]);
}
