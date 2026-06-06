import type { VisitMedia } from '@/types';

import { VisitMediaThumbnail } from './visit-media-thumbnail';

type VisitMediaFeaturedItemProps = {
  media: VisitMedia;
  onPress?: () => void;
  onLongPress?: () => void;
};

export function VisitMediaFeaturedItem({ media, onPress, onLongPress }: VisitMediaFeaturedItemProps) {
  return (
    <VisitMediaThumbnail
      media={media}
      aspectRatio={16 / 9}
      onPress={onPress}
      onLongPress={onLongPress}
      style={{ width: '100%' }}
    />
  );
}
