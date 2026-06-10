import * as FileSystem from 'expo-file-system/legacy';
import { Image as RNImage } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as VideoThumbnails from 'expo-video-thumbnails';

import { FREE_PHOTO_LIMIT } from '@/constants';
import type { MediaType, StoredVisitMediaInput } from '@/types';

export type { StoredVisitMediaInput };

const PHOTO_REL_DIR = 'visit-photos/';
const VIDEO_REL_DIR = 'visit-videos/';
const THUMBNAIL_REL_DIR = 'visit-video-thumbs/';

function getDocumentDirectory() {
  if (!FileSystem.documentDirectory) {
    throw new Error('メディアの保存先を準備できませんでした。');
  }
  return FileSystem.documentDirectory;
}

function getPhotoDir() {
  return `${getDocumentDirectory()}${PHOTO_REL_DIR}`;
}

function getVideoDir() {
  return `${getDocumentDirectory()}${VIDEO_REL_DIR}`;
}

function getThumbnailDir() {
  return `${getDocumentDirectory()}${THUMBNAIL_REL_DIR}`;
}

async function ensureDir(path: string) {
  const info = await FileSystem.getInfoAsync(path);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(path, { intermediates: true });
  }
}

async function ensureMediaDirs() {
  await ensureDir(getPhotoDir());
  await ensureDir(getVideoDir());
  await ensureDir(getThumbnailDir());
}

const KNOWN_IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'heic', 'heif', 'webp', 'gif']);
const KNOWN_VIDEO_EXTENSIONS = new Set(['mp4', 'mov', 'm4v']);

function normalizeExtension(raw: string | null | undefined, mediaType: MediaType): string | null {
  if (!raw) return null;
  const ext = raw.toLowerCase();
  if (mediaType === 'image' && KNOWN_IMAGE_EXTENSIONS.has(ext)) {
    return ext === 'jpeg' ? 'jpg' : ext;
  }
  if (mediaType === 'video' && KNOWN_VIDEO_EXTENSIONS.has(ext)) {
    return ext;
  }
  return null;
}

function getExtensionFromAsset(asset: ImagePicker.ImagePickerAsset, mediaType: MediaType): string {
  const candidates: (string | null | undefined)[] = [
    asset.fileName?.split('.').pop(),
    asset.mimeType?.split('/').pop(),
    asset.uri.split('?')[0].split('#')[0].split('.').pop(),
  ];
  for (const raw of candidates) {
    const normalized = normalizeExtension(raw, mediaType);
    if (normalized) return normalized;
  }
  return mediaType === 'video' ? 'mp4' : 'jpg';
}

function isVideoAsset(asset: ImagePicker.ImagePickerAsset) {
  if (asset.type === 'video') return true;
  const mime = asset.mimeType?.toLowerCase() ?? '';
  return mime.startsWith('video/');
}

function getMediaPickerError(error: unknown): Error {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes('PHPhotosErrorDomain error 3164') || message.includes('PHPhotosErrorDomain error 3169')) {
    return new Error(
      '選択した写真や動画をiCloudから取得できませんでした。インターネット接続を確認して、もう一度お試しください。',
    );
  }
  return error instanceof Error ? error : new Error('写真や動画を追加できませんでした。もう一度お試しください。');
}

export function resolveMediaUri(stored: string): string {
  if (!stored) return stored;

  for (const marker of [PHOTO_REL_DIR, VIDEO_REL_DIR, THUMBNAIL_REL_DIR]) {
    const idx = stored.indexOf(marker);
    if (idx >= 0) {
      return `${getDocumentDirectory()}${stored.slice(idx)}`;
    }
  }

  return stored;
}

export function toRelativeMediaPath(stored: string): string {
  for (const marker of [PHOTO_REL_DIR, VIDEO_REL_DIR, THUMBNAIL_REL_DIR]) {
    const idx = stored.indexOf(marker);
    if (idx >= 0) {
      return stored.slice(idx);
    }
  }
  return stored;
}

export async function deleteMediaFiles(storedPaths: (string | null | undefined)[]) {
  for (const stored of storedPaths) {
    if (!stored) continue;
    try {
      const fullUri = resolveMediaUri(stored);
      const info = await FileSystem.getInfoAsync(fullUri);
      if (info.exists) {
        await FileSystem.deleteAsync(fullUri, { idempotent: true });
      }
    } catch {
      // 個別の削除失敗は致命的ではないため握りつぶす
    }
  }
}

async function getImageDimensions(uri: string): Promise<{ width: number; height: number } | undefined> {
  try {
    return await new Promise((resolve) => {
      RNImage.getSize(
        uri,
        (width, height) => resolve({ width, height }),
        () => resolve(undefined),
      );
    });
  } catch {
    return undefined;
  }
}

async function storeVideoAsset(
  asset: ImagePicker.ImagePickerAsset,
  index: number,
): Promise<StoredVisitMediaInput> {
  const extension = getExtensionFromAsset(asset, 'video');
  const filename = `${Date.now()}-${index}.${extension}`;
  const target = `${getVideoDir()}${filename}`;
  await FileSystem.copyAsync({ from: asset.uri, to: target });

  const dimensions =
    asset.width && asset.height
      ? { width: asset.width, height: asset.height }
      : undefined;

  let thumbnailUri: string | undefined;
  try {
    const thumb = await VideoThumbnails.getThumbnailAsync(target, { time: 0 });
    const thumbFilename = `${Date.now()}-${index}-thumb.jpg`;
    const thumbTarget = `${getThumbnailDir()}${thumbFilename}`;
    await FileSystem.copyAsync({ from: thumb.uri, to: thumbTarget });
    thumbnailUri = thumbTarget;
  } catch {
    thumbnailUri = undefined;
  }

  return {
    uri: target,
    mediaType: 'video',
    thumbnailUri,
    width: dimensions?.width,
    height: dimensions?.height,
  };
}

async function storeImageAsset(
  asset: ImagePicker.ImagePickerAsset,
  index: number,
): Promise<StoredVisitMediaInput> {
  const extension = getExtensionFromAsset(asset, 'image');
  const filename = `${Date.now()}-${index}.${extension}`;
  const target = `${getPhotoDir()}${filename}`;
  await FileSystem.copyAsync({ from: asset.uri, to: target });

  const info = await FileSystem.getInfoAsync(target);
  if (!info.exists) {
    throw new Error(`写真の保存に失敗しました（${asset.fileName ?? asset.uri}）`);
  }

  const dimensions =
    asset.width && asset.height
      ? { width: asset.width, height: asset.height }
      : await getImageDimensions(target);

  return {
    uri: target,
    mediaType: 'image',
    width: dimensions?.width,
    height: dimensions?.height,
  };
}

export async function pickAndStoreVisitMedia(currentCount: number, isPremium: boolean) {
  const remaining = isPremium ? 0 : Math.max(FREE_PHOTO_LIMIT - currentCount, 0);

  if (!isPremium && remaining <= 0) {
    return {
      items: [] as StoredVisitMediaInput[],
      limitReached: true,
    };
  }

  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new Error('写真や動画を選ぶには写真ライブラリへのアクセス許可が必要です。');
  }

  let result: ImagePicker.ImagePickerResult;
  try {
    result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsMultipleSelection: true,
      orderedSelection: true,
      quality: 0.88,
      selectionLimit: isPremium ? 0 : remaining,
      videoMaxDuration: 120,
    });
  } catch (error) {
    throw getMediaPickerError(error);
  }

  if (result.canceled) {
    return {
      items: [] as StoredVisitMediaInput[],
      limitReached: false,
    };
  }

  await ensureMediaDirs();

  const storedItems: StoredVisitMediaInput[] = [];

  for (const [index, asset] of result.assets.entries()) {
    const stored = isVideoAsset(asset)
      ? await storeVideoAsset(asset, index)
      : await storeImageAsset(asset, index);
    storedItems.push(stored);
  }

  return {
    items: storedItems,
    limitReached: false,
  };
}
