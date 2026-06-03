import { useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';
import Sortable from 'react-native-sortables';

import { spacing } from '@/theme';
import type { VisitMedia } from '@/types';

import { handleOutsideDrop } from './drag-drop/handle-outside-drop';
import type { DragTargetsApi } from './drag-drop/types';
import { VisitMediaThumbnail } from './visit-media-thumbnail';

type AlbumDragState = {
  dragging: boolean;
  overTrash: boolean;
};

type VisitMediaAlbumGridProps = {
  media: VisitMedia[];
  onPressMedia: (media: VisitMedia, index: number) => void;
  onDragStateChange: (state: AlbumDragState) => void;
  onDeleteMedia: (media: VisitMedia) => void;
  onReorder: (ordered: VisitMedia[]) => void;
  targets: DragTargetsApi;
};

export function VisitMediaAlbumGrid({
  media,
  onPressMedia,
  onDragStateChange,
  onDeleteMedia,
  onReorder,
  targets,
}: VisitMediaAlbumGridProps) {
  const [dragKey, setDragKey] = useState<string | null>(null);
  const gap = spacing.sm;

  const draggedMedia = useMemo(
    () => (dragKey ? (media.find((m) => m.id === dragKey) ?? null) : null),
    [dragKey, media],
  );

  const handleDropOutsideReorder = useCallback(() => {
    handleOutsideDrop({
      dragged: draggedMedia,
      targets,
      onDelete: onDeleteMedia,
    });
  }, [draggedMedia, onDeleteMedia, targets]);

  return (
    <View>
      <Sortable.Grid
        columns={2}
        data={media}
        keyExtractor={(item) => item.id}
        columnGap={gap}
        rowGap={gap}
        onDragStart={({ key }) => {
          setDragKey(key);
          targets.clearOver();
          onDragStateChange({ dragging: true, overTrash: false });
        }}
        onDragMove={({ touchData }) => {
          const point = {
            absoluteX: touchData.absoluteX,
            absoluteY: touchData.absoluteY,
          };
          targets.updateOver(point);
          onDragStateChange({
            dragging: true,
            overTrash: Boolean(targets.isOverTarget('trash', point)),
          });
        }}
        onActiveItemDropped={() => {
          handleDropOutsideReorder();
          setDragKey(null);
          targets.clearOver();
          onDragStateChange({ dragging: false, overTrash: false });
        }}
        onDragEnd={({ data }) => {
          if (targets.over.trash) return;
          onReorder(data);
        }}
        renderItem={({ item, index }) => (
          <VisitMediaThumbnail
            media={item}
            aspectRatio={1}
            onPress={() => onPressMedia(item, index)}
          />
        )}
      />
    </View>
  );
}
