import { COUNTRIES } from '@/data';
import { deletePhotoFiles, nowISO } from '@/lib';

import type { Database } from './client';

export async function seedCountries(db: Database) {
  for (const country of COUNTRIES) {
    await db.runAsync(
      `
      INSERT OR REPLACE INTO countries
        (id, name_ja, name_en, flag, region, continent, iso_code)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
      country.id,
      country.nameJa,
      country.nameEn,
      country.flag,
      country.region,
      country.continent,
      country.isoCode,
    );
  }
}

export async function ensurePurchaseRow(db: Database) {
  const existing = await db.getFirstAsync<{ id: string }>(
    'SELECT id FROM purchases WHERE id = ?',
    'local',
  );
  if (!existing) {
    await db.runAsync(
      'INSERT INTO purchases (id, is_premium, entitlement_id, updated_at) VALUES (?, ?, ?, ?)',
      'local',
      0,
      null,
      nowISO(),
    );
  }
}

export async function migratePhotoPathsToRelative(db: Database) {
  await db.runAsync(
    `UPDATE photos
       SET uri = substr(uri, instr(uri, 'visit-photos/'))
     WHERE uri LIKE '%visit-photos/%'
       AND uri NOT LIKE 'visit-photos/%'`,
  );

  // thumbnail_uri は migrateVisitMediaColumns の後にのみ存在する
  if (await photosColumnExists(db, 'thumbnail_uri')) {
    await db.runAsync(
      `UPDATE photos
         SET thumbnail_uri = substr(thumbnail_uri, instr(thumbnail_uri, 'visit-videos/'))
       WHERE thumbnail_uri LIKE '%visit-videos/%'
         AND thumbnail_uri NOT LIKE 'visit-videos/%'`,
    );
  }
}

async function photosColumnExists(db: Database, column: string) {
  const columns = await db.getAllAsync<{ name: string }>('PRAGMA table_info(photos)');
  return columns.some((row) => row.name === column);
}

export async function migrateVisitMediaColumns(db: Database) {
  if (!(await photosColumnExists(db, 'media_type'))) {
    await db.runAsync(`ALTER TABLE photos ADD COLUMN media_type TEXT NOT NULL DEFAULT 'image'`);
  }
  if (!(await photosColumnExists(db, 'sort_order'))) {
    await db.runAsync(`ALTER TABLE photos ADD COLUMN sort_order INTEGER`);
  }
  if (!(await photosColumnExists(db, 'thumbnail_uri'))) {
    await db.runAsync(`ALTER TABLE photos ADD COLUMN thumbnail_uri TEXT`);
  }
  if (!(await photosColumnExists(db, 'width'))) {
    await db.runAsync(`ALTER TABLE photos ADD COLUMN width REAL`);
  }
  if (!(await photosColumnExists(db, 'height'))) {
    await db.runAsync(`ALTER TABLE photos ADD COLUMN height REAL`);
  }

  const visits = await db.getAllAsync<{ visitId: string }>(
    'SELECT DISTINCT visit_id as visitId FROM photos',
  );

  for (const { visitId } of visits) {
    const rows = await db.getAllAsync<{ id: string; sortOrder: number | null }>(
      'SELECT id, sort_order as sortOrder FROM photos WHERE visit_id = ? ORDER BY created_at ASC',
      visitId,
    );
    for (const [index, row] of rows.entries()) {
      if (row.sortOrder === null) {
        await db.runAsync('UPDATE photos SET sort_order = ? WHERE id = ?', index, row.id);
      }
    }
  }
}

export async function removeJapanLegacyData(db: Database) {
  const jpVisitIds = await db.getAllAsync<{ id: string }>(
    `SELECT id FROM visits WHERE country_id = ?`,
    'jp',
  );
  if (jpVisitIds.length > 0) {
    const placeholders = jpVisitIds.map(() => '?').join(',');
    const ids = jpVisitIds.map((row) => row.id);
    const photos = await db.getAllAsync<{ uri: string; thumbnailUri: string | null }>(
      `SELECT uri, thumbnail_uri as thumbnailUri FROM photos WHERE visit_id IN (${placeholders})`,
      ...ids,
    );
    await deletePhotoFiles([
      ...photos.map((p) => p.uri),
      ...photos.map((p) => p.thumbnailUri).filter((uri): uri is string => Boolean(uri)),
    ]);
    await db.runAsync(`DELETE FROM visits WHERE country_id = ?`, 'jp');
  }
  await db.runAsync(`DELETE FROM bucket_list WHERE country_id = ?`, 'jp');
  await db.runAsync(`DELETE FROM bucket_memos WHERE country_id = ?`, 'jp');
  await db.runAsync(`DELETE FROM countries WHERE id = ?`, 'jp');
}
