import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { PaperCard } from '@/components';
import { FREE_PHOTO_LIMIT } from '@/constants';
import { spacing } from '@/theme';
import type { VisitMedia } from '@/types';

import { TrashDropZone } from './drag-drop/trash-drop-zone';
import { useDragTargets } from './drag-drop/use-drag-targets';
import { VisitMediaAddButton } from './visit-media-add-button';
import { VisitMediaSectionGrid } from './visit-media-section-grid';
import { VisitMediaSectionHeader } from './visit-media-section-header';

type VisitMediaSectionProps = {
  isPremium: boolean;
  media: VisitMedia[];
  showSeeAll: boolean;
  onSeeAll: () => void;
  onPickMedia: () => void;
  onPressMedia: (media: VisitMedia, index: number) => void;
  onDeleteMedia: (media: VisitMedia) => void;
  onMoveToFront: (media: VisitMedia) => void;
  onReorder: (ordered: VisitMedia[]) => void;
};

export function VisitMediaSection({
  isPremium,
  media,
  showSeeAll,
  onSeeAll,
  onPickMedia,
  onPressMedia,
  onDeleteMedia,
  onMoveToFront,
  onReorder,
}: VisitMediaSectionProps) {
  const targets = useDragTargets();
  const [dragging, setDragging] = useState(false);
  const [overTrash, setOverTrash] = useState(false);
  const displayMedia = media.slice(0, FREE_PHOTO_LIMIT);
  const featured = displayMedia[0];
  const gridMedia = displayMedia.slice(1);
  const remainingCount = Math.max(FREE_PHOTO_LIMIT - media.length, 0);

  const helperText = isPremium
    ? '有料版では、写真や動画を無制限に追加できます。'
    : remainingCount > 0
      ? '無料版では10枚まできれいに表示'
      : '11枚目からは買い切り版で無制限に保存できます。';

  return (
    <PaperCard inset style={styles.section}>
      <VisitMediaSectionHeader helperText={helperText} showSeeAll={showSeeAll} onSeeAll={onSeeAll} />
      <VisitMediaSectionGrid
        displayMedia={displayMedia}
        featured={featured}
        gridMedia={gridMedia}
        targets={targets}
        onPressMedia={onPressMedia}
        onDeleteMedia={onDeleteMedia}
        onMoveToFront={onMoveToFront}
        onReorder={onReorder}
        onDragStateChange={({ dragging: nextDragging, overTrash: nextOverTrash }) => {
          setDragging(nextDragging);
          setOverTrash(nextOverTrash);
        }}
      />
      {dragging ? (
        <TrashDropZone
          variant="section"
          visible
          isActive={overTrash}
          onMeasured={(rect) => targets.setTarget('trash', rect)}
        />
      ) : (
        <VisitMediaAddButton onPress={onPickMedia} />
      )}
    </PaperCard>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.md,
  },
});
