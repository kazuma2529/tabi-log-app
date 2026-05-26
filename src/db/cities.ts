import { createId, nowISO } from '@/lib';
import type { City } from '@/types';

import { getDatabase } from './client';

export async function addCity(visitId: string, name: string): Promise<City | null> {
  const trimmed = name.trim();
  if (trimmed.length === 0) return null;

  const db = await getDatabase();
  const id = createId('city');
  const createdAt = nowISO();
  await db.runAsync(
    'INSERT INTO cities (id, visit_id, name, created_at) VALUES (?, ?, ?, ?)',
    id,
    visitId,
    trimmed,
    createdAt,
  );
  return { id, visitId, name: trimmed, createdAt };
}

export async function removeCity(cityId: string): Promise<City | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ id: string; visitId: string; name: string; createdAt: string }>(
    'SELECT id, visit_id as visitId, name, created_at as createdAt FROM cities WHERE id = ?',
    cityId,
  );
  if (!row) return null;
  await db.runAsync('DELETE FROM cities WHERE id = ?', cityId);
  return row;
}

export async function restoreCity(city: City) {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT OR REPLACE INTO cities (id, visit_id, name, created_at) VALUES (?, ?, ?, ?)',
    city.id,
    city.visitId,
    city.name,
    city.createdAt,
  );
}
