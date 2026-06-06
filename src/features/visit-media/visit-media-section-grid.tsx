import { useCallback, useState } from "react";
import { LayoutChangeEvent, StyleSheet, View } from "react-native";
import Sortable from "react-native-sortables";

import { radius, spacing } from "@/theme";
import type { VisitMedia } from "@/types";

import { handleOutsideDrop } from "./drag-drop/handle-outside-drop";
import { useMeasureInWindow } from "./drag-drop/measure-in-window";
import type { DragTargetsApi } from "./drag-drop/types";
import {
    showFeaturedDeleteActionSheet,
    showMediaActionSheet,
} from "./show-media-action-sheet";
import { VisitMediaFeaturedItem } from "./visit-media-featured-item";
import { VisitMediaThumbnail } from "./visit-media-thumbnail";

type VisitMediaSectionGridProps = {
  displayMedia: VisitMedia[];
  featured: VisitMedia | undefined;
  gridMedia: VisitMedia[];
  targets: DragTargetsApi;
  onPressMedia: (media: VisitMedia, index: number) => void;
  onDeleteMedia: (media: VisitMedia) => void;
  onMoveToFront: (media: VisitMedia) => void;
  onReorder: (ordered: VisitMedia[]) => void;
  onDragStateChange?: (state: { dragging: boolean; overTrash: boolean }) => void;
};

export function VisitMediaSectionGrid({
  displayMedia,
  featured,
  gridMedia,
  targets,
  onPressMedia,
  onDeleteMedia,
  onMoveToFront,
  onReorder,
  onDragStateChange,
}: VisitMediaSectionGridProps) {
  const [containerWidth, setContainerWidth] = useState(0);
  const [dragKey, setDragKey] = useState<string | null>(null);
  const gap = spacing.sm;
  const tileWidth = containerWidth > 0 ? (containerWidth - gap * 2) / 3 : 0;

  const featuredMeasure = useMeasureInWindow((rect) =>
    targets.setTarget("featured", rect),
  );

  const openGridActions = useCallback(
    (item: VisitMedia) => {
      showMediaActionSheet({
        onMoveToFront: () => onMoveToFront(item),
        onDelete: () => onDeleteMedia(item),
      });
    },
    [onDeleteMedia, onMoveToFront],
  );

  const openFeaturedDelete = useCallback(() => {
    if (!featured) return;
    showFeaturedDeleteActionSheet({
      onDelete: () => onDeleteMedia(featured),
    });
  }, [featured, onDeleteMedia]);

  const onLayout = (event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  };

  const draggedMedia = dragKey
    ? (displayMedia.find((m) => m.id === dragKey) ?? null)
    : null;

  const handleDropOutsideReorder = useCallback(() => {
    handleOutsideDrop({
      dragged: draggedMedia,
      targets,
      onDelete: onDeleteMedia,
      onMoveToFeatured: (dragged) => {
        onReorder([
          dragged,
          ...displayMedia.filter((m) => m.id !== dragged.id),
        ]);
      },
    });
  }, [displayMedia, draggedMedia, onDeleteMedia, onReorder, targets]);

  if (displayMedia.length === 0) {
    return null;
  }

  return (
    <>
      <View style={styles.mediaBlock} onLayout={onLayout}>
        {featured ? (
          <View
            ref={featuredMeasure.ref}
            onLayout={featuredMeasure.onLayout}
            style={[
              targets.over.featured && dragKey
                ? styles.featuredHighlight
                : null,
            ]}
          >
            <VisitMediaFeaturedItem
              media={featured}
              onPress={() => onPressMedia(featured, 0)}
              onLongPress={openFeaturedDelete}
            />
          </View>
        ) : null}

        {gridMedia.length > 0 && tileWidth > 0 ? (
          <Sortable.Grid
            columns={3}
            data={gridMedia}
            columnGap={gap}
            rowGap={gap}
            keyExtractor={(item) => item.id}
            onDragStart={({ key }) => {
              setDragKey(key);
              targets.clearOver();
              onDragStateChange?.({ dragging: true, overTrash: false });
            }}
            onDragMove={({ touchData }) => {
              const point = {
                absoluteX: touchData.absoluteX,
                absoluteY: touchData.absoluteY,
              };
              targets.updateOver(point);
              onDragStateChange?.({
                dragging: true,
                overTrash: Boolean(targets.isOverTarget('trash', point)),
              });
            }}
            onActiveItemDropped={() => {
              handleDropOutsideReorder();
              setDragKey(null);
              targets.clearOver();
              onDragStateChange?.({ dragging: false, overTrash: false });
            }}
            onDragEnd={({ data }) => {
              if (targets.over.trash || targets.over.featured) {
                onDragStateChange?.({ dragging: false, overTrash: false });
                return;
              }
              onReorder(featured ? [featured, ...data] : data);
              setDragKey(null);
              targets.clearOver();
              onDragStateChange?.({ dragging: false, overTrash: false });
            }}
            renderItem={({ item }) => {
              const index = displayMedia.findIndex(
                (entry) => entry.id === item.id,
              );
              return (
                <VisitMediaThumbnail
                  media={item}
                  onPress={() => onPressMedia(item, index)}
                  onLongPress={() => openGridActions(item)}
                />
              );
            }}
          />
        ) : null}

        {gridMedia.length > 0 && tileWidth <= 0 ? (
          <View style={[styles.staticGrid, { gap }]}>
            {gridMedia.map((item) => {
              const index = displayMedia.findIndex(
                (entry) => entry.id === item.id,
              );
              return (
                <View
                  key={item.id}
                  style={[styles.gridTile, { width: "31.5%" }]}
                >
                  <VisitMediaThumbnail
                    media={item}
                    onPress={() => onPressMedia(item, index)}
                    onLongPress={() => openGridActions(item)}
                  />
                </View>
              );
            })}
          </View>
        ) : null}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  mediaBlock: {
    gap: spacing.sm,
  },
  staticGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  gridTile: {
    overflow: "hidden",
  },
  featuredHighlight: {
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: "rgba(47, 155, 145, 0.55)",
  },
});
