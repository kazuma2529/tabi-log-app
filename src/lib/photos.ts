import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';

import { FREE_PHOTO_LIMIT } from '@/constants';

const PHOTO_REL_DIR = 'visit-photos/';

function getDocumentDirectory() {
  if (!FileSystem.documentDirectory) {
    throw new Error('写真の保存先を準備できませんでした。');
  }
  return FileSystem.documentDirectory;
}

function getPhotoDir() {
  return `${getDocumentDirectory()}${PHOTO_REL_DIR}`;
}

async function ensurePhotoDir() {
  const photoDir = getPhotoDir();
  const info = await FileSystem.getInfoAsync(photoDir);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(photoDir, { intermediates: true });
  }
}

const KNOWN_IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'heic', 'heif', 'webp', 'gif']);

function normalizeExtension(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const ext = raw.toLowerCase();
  if (!KNOWN_IMAGE_EXTENSIONS.has(ext)) return null;
  return ext === 'jpeg' ? 'jpg' : ext;
}

function getExtensionFromAsset(asset: ImagePicker.ImagePickerAsset): string {
  const candidates: (string | null | undefined)[] = [
    asset.fileName?.split('.').pop(),
    asset.mimeType?.split('/').pop(),
    asset.uri.split('?')[0].split('#')[0].split('.').pop(),
  ];
  for (const raw of candidates) {
    const normalized = normalizeExtension(raw);
    if (normalized) return normalized;
  }
  return 'jpg';
}

/**
 * DB に保存されているパス（旧: 絶対 file:// URI / 新: 相対パス）を、
 * 現在の documentDirectory に基づく絶対 URI に解決する。
 */
export function resolvePhotoUri(stored: string): string {
  if (!stored) return stored;

  const marker = PHOTO_REL_DIR;
  const idx = stored.indexOf(marker);
  if (idx >= 0) {
    const relative = stored.slice(idx);
    return `${getDocumentDirectory()}${relative}`;
  }

  return stored;
}

/**
 * DB に保存するための相対パス形式に正規化する。
 */
export function toRelativePhotoPath(stored: string): string {
  const marker = PHOTO_REL_DIR;
  const idx = stored.indexOf(marker);
  if (idx >= 0) {
    return stored.slice(idx);
  }
  return stored;
}

export async function deletePhotoFiles(storedPaths: string[]) {
  for (const stored of storedPaths) {
    try {
      const fullUri = resolvePhotoUri(stored);
      const info = await FileSystem.getInfoAsync(fullUri);
      if (info.exists) {
        await FileSystem.deleteAsync(fullUri, { idempotent: true });
      }
    } catch {
      // 個別の削除失敗は致命的ではないため握りつぶす
    }
  }
}

export async function pickAndStoreVisitPhotos(currentCount: number, isPremium: boolean) {
  const remaining = isPremium ? 0 : Math.max(FREE_PHOTO_LIMIT - currentCount, 0);

  if (!isPremium && remaining <= 0) {
    return {
      uris: [],
      limitReached: true,
    };
  }

  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new Error('写真を選ぶには写真ライブラリへのアクセス許可が必要です。');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsMultipleSelection: true,
    orderedSelection: true,
    quality: 0.88,
    selectionLimit: isPremium ? 0 : remaining,
  });

  if (result.canceled) {
    return {
      uris: [],
      limitReached: false,
    };
  }

  await ensurePhotoDir();

  // 表示側（expo-image）は絶対 file:// URI を必要とするため、ここでは絶対 URI を返す。
  // DB 保存時には toRelativePhotoPath で相対パスに正規化される（database.ts 側で実施）。
  const storedAbsoluteUris: string[] = [];
  const photoDir = getPhotoDir();

  for (const [index, asset] of result.assets.entries()) {
    const extension = getExtensionFromAsset(asset);
    const filename = `${Date.now()}-${index}.${extension}`;
    const target = `${photoDir}${filename}`;
    await FileSystem.copyAsync({ from: asset.uri, to: target });

    // 保存後に実ファイルが存在するか検証する。失敗していれば原因が分かるよう明示的に投げる。
    const info = await FileSystem.getInfoAsync(target);
    if (!info.exists) {
      throw new Error(`写真の保存に失敗しました（${asset.fileName ?? asset.uri}）`);
    }

    storedAbsoluteUris.push(target);
  }

  return {
    uris: storedAbsoluteUris,
    limitReached: false,
  };
}
