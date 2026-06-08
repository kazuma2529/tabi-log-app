import { useCallback } from 'react';

import { useUndoToast } from '@/components';
import { usePremiumMediaPicker } from '@/features/visit-media/use-premium-media-picker';
import { useErrorAlert, useTravel } from '@/hooks';
import type { VisitMedia } from '@/types';

type UseVisitMediaActionsOptions = {
  visitId?: string;
  currentCount?: number;
};

export function useVisitMediaActions({ visitId, currentCount = 0 }: UseVisitMediaActionsOptions) {
  const {
    addMediaToVisit,
    removePhoto,
    restorePhoto,
    purgePhotoFile,
    reorderVisitMedia,
    moveVisitMediaToFront,
  } = useTravel();
  const { showUndoToast } = useUndoToast();
  const { pickVisitMediaWithPremiumGate } = usePremiumMediaPicker();
  const { runWithErrorAlert } = useErrorAlert();

  const handlePickMedia = useCallback(async () => {
    if (!visitId) return;
    await runWithErrorAlert('写真や動画を追加できませんでした', async () => {
      await pickVisitMediaWithPremiumGate({
        currentCount,
        onPicked: async (items) => {
          await addMediaToVisit(visitId, items);
        },
      });
    });
  }, [addMediaToVisit, currentCount, pickVisitMediaWithPremiumGate, runWithErrorAlert, visitId]);

  const handleRemoveMedia = useCallback(
    async (media: VisitMedia) => {
      await runWithErrorAlert('削除できませんでした', async () => {
        const removed = await removePhoto(media.id);
        if (!removed) return;
        showUndoToast({
          label: '思い出を削除しました',
          onUndo: async () => {
            try {
              await restorePhoto(removed);
            } catch {
              // 復元失敗時は黙る
            }
          },
          onExpire: async () => {
            try {
              await purgePhotoFile(removed.uri);
              if (removed.thumbnailUri) {
                await purgePhotoFile(removed.thumbnailUri);
              }
            } catch {
              // ファイル削除失敗は黙る
            }
          },
        });
      });
    },
    [purgePhotoFile, removePhoto, restorePhoto, runWithErrorAlert, showUndoToast],
  );

  const handleMoveToFront = useCallback(
    async (media: VisitMedia) => {
      if (!visitId) return;
      await runWithErrorAlert('並び順を更新できませんでした', async () => {
        await moveVisitMediaToFront(visitId, media.id);
      });
    },
    [moveVisitMediaToFront, runWithErrorAlert, visitId],
  );

  const handleReorder = useCallback(
    async (ordered: VisitMedia[]) => {
      if (!visitId) return;
      await runWithErrorAlert('並び順を更新できませんでした', async () => {
        await reorderVisitMedia(visitId, ordered.map((item) => item.id));
      });
    },
    [reorderVisitMedia, runWithErrorAlert, visitId],
  );

  return {
    handlePickMedia,
    handleRemoveMedia,
    handleMoveToFront,
    handleReorder,
  };
}
