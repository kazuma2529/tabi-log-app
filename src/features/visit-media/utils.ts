import type { VisitMedia } from '@/types';

export function sortVisitMedia(media: VisitMedia[]): VisitMedia[] {
  return [...media].sort((a, b) => a.sortOrder - b.sortOrder || a.createdAt.localeCompare(b.createdAt));
}

export function getDisplayUri(media: VisitMedia): string {
  if (media.mediaType === 'video' && media.thumbnailUri) {
    return media.thumbnailUri;
  }
  return media.uri;
}

export function countMediaByType(media: VisitMedia[]) {
  let imageCount = 0;
  let videoCount = 0;
  for (const item of media) {
    if (item.mediaType === 'video') {
      videoCount += 1;
    } else {
      imageCount += 1;
    }
  }
  return { imageCount, videoCount };
}

export function formatMediaCountLabel(imageCount: number, videoCount: number) {
  return `写真${imageCount}枚・動画${videoCount}本`;
}
