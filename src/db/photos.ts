import {
  createId,
  deletePhotoFiles,
  nowISO,
  resolveMediaUri,
  toRelativeMediaPath,
} from '@/lib';
import type { MediaType, StoredVisitMediaInput, VisitMedia } from '@/types';

import { getDatabase } from './client';

type PhotoRow = {
  id: string;
  visitId: string;
  uri: string;
  mediaType: MediaType;
  thumbnailUri: string | null;
  sortOrder: number;
  width: number | null;
  height: number | null;
  createdAt: string;
};

function mapPhotoRow(row: PhotoRow): VisitMedia {
  return {
    id: row.id,
    visitId: row.visitId,
    uri: resolveMediaUri(row.uri),
    mediaType: row.mediaType,
    thumbnailUri: row.thumbnailUri ? resolveMediaUri(row.thumbnailUri) : null,
    sortOrder: row.sortOrder,
    width: row.width,
    height: row.height,
    createdAt: row.createdAt,
  };
}

const PHOTO_SELECT = `
  SELECT
    id,
    visit_id as visitId,
    uri,
    media_type as mediaType,
    thumbnail_uri as thumbnailUri,
    sort_order as sortOrder,
    width,
    height,
    created_at as createdAt
  FROM photos
`;

async function getNextSortOrder(db: Awaited<ReturnType<typeof getDatabase>>, visitId: string) {
  const row = await db.getFirstAsync<{ maxOrder: number | null }>(
    'SELECT MAX(sort_order) as maxOrder FROM photos WHERE visit_id = ?',
    visitId,
  );
  return (row?.maxOrder ?? -1) + 1;
}

export async function addMediaToVisit(
  visitId: string,
  items: StoredVisitMediaInput[],
): Promise<VisitMedia[]> {
  if (items.length === 0) return [];
  const db = await getDatabase();
  const createdAt = nowISO();
  const inserted: VisitMedia[] = [];
  let sortOrder = await getNextSortOrder(db, visitId);

  for (const item of items) {
    const id = createId('photo');
    const relative = toRelativeMediaPath(item.uri);
    const thumbnailRelative = item.thumbnailUri ? toRelativeMediaPath(item.thumbnailUri) : null;
    await db.runAsync(
      `INSERT INTO photos (
        id, visit_id, uri, media_type, thumbnail_uri, sort_order, width, height, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      id,
      visitId,
      relative,
      item.mediaType,
      thumbnailRelative,
      sortOrder,
      item.width ?? null,
      item.height ?? null,
      createdAt,
    );
    inserted.push(
      mapPhotoRow({
        id,
        visitId,
        uri: relative,
        mediaType: item.mediaType,
        thumbnailUri: thumbnailRelative,
        sortOrder,
        width: item.width ?? null,
        height: item.height ?? null,
        createdAt,
      }),
    );
    sortOrder += 1;
  }

  return inserted;
}

export async function removePhoto(photoId: string): Promise<VisitMedia | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<PhotoRow>(`${PHOTO_SELECT} WHERE id = ?`, photoId);
  if (!row) return null;
  await db.runAsync('DELETE FROM photos WHERE id = ?', photoId);
  return mapPhotoRow(row);
}

export async function restorePhoto(photo: VisitMedia) {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT OR REPLACE INTO photos (
      id, visit_id, uri, media_type, thumbnail_uri, sort_order, width, height, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    photo.id,
    photo.visitId,
    toRelativeMediaPath(photo.uri),
    photo.mediaType,
    photo.thumbnailUri ? toRelativeMediaPath(photo.thumbnailUri) : null,
    photo.sortOrder,
    photo.width,
    photo.height,
    photo.createdAt,
  );
}

export async function purgePhotoFile(storedUri: string) {
  await deletePhotoFiles([storedUri]);
}

export async function reorderVisitMedia(visitId: string, orderedIds: string[]) {
  const db = await getDatabase();
  for (const [index, id] of orderedIds.entries()) {
    await db.runAsync(
      'UPDATE photos SET sort_order = ? WHERE id = ? AND visit_id = ?',
      index,
      id,
      visitId,
    );
  }
}

export async function moveVisitMediaToFront(visitId: string, mediaId: string) {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ id: string }>(
    'SELECT id FROM photos WHERE visit_id = ? ORDER BY sort_order ASC, created_at ASC',
    visitId,
  );
  const orderedIds = rows.map((row) => row.id).filter((id) => id !== mediaId);
  orderedIds.unshift(mediaId);
  await reorderVisitMedia(visitId, orderedIds);
}
