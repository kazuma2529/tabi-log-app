import { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Alert } from 'react-native';

import { useUndoToast } from '@/components';
import { getMemoDefinition } from '@/data';
import { useErrorAlert, usePremium, useTravel } from '@/hooks';
import { pickAndStoreVisitPhotos, PREMIUM_PHOTO_LIMIT_REACHED_MESSAGE, toISODate } from '@/lib';
import type { City, CountrySummary, MemoCard, MemoType, Photo, VisitBundle } from '@/types';

type UseVisitEditorInput = {
  selectedVisit: VisitBundle | undefined;
  summary: CountrySummary | undefined;
  cityDraft: string;
  memoDraft: string;
  setSelectedVisitId: (id: string | null) => void;
  setDatePickerOpen: (open: boolean) => void;
  setCityDraft: (value: string) => void;
  setCityInputOpen: (open: boolean) => void;
  setMemoPickerOpen: (open: boolean) => void;
  setEditingMemoId: (id: string | null) => void;
  setMemoDraft: (value: string) => void;
  setMemoFilter: (filter: 'all' | MemoType) => void;
};

/**
 * 国詳細画面のミューテーション系ハンドラーを 1 か所に集約する。
 * UI 状態（picker の開閉、編集中 memo の id など）は screen 側で保持し、
 * setter をこの hook に渡す形で「画面 → ハンドラー → DB」の流れを薄くつなぐ。
 *
 * 各ハンドラーの内部実装はリファクタ前と同一。
 */
export function useVisitEditor({
  selectedVisit,
  summary,
  cityDraft,
  memoDraft,
  setSelectedVisitId,
  setDatePickerOpen,
  setCityDraft,
  setCityInputOpen,
  setMemoPickerOpen,
  setEditingMemoId,
  setMemoDraft,
  setMemoFilter,
}: UseVisitEditorInput) {
  const router = useRouter();
  const {
    removeVisit,
    updateVisitDate,
    addCity,
    removeCity,
    restoreCity,
    addPhotosToVisit,
    removePhoto,
    restorePhoto,
    purgePhotoFile,
    addMemo,
    updateMemoContent,
    removeMemo,
    restoreMemo,
  } = useTravel();
  const { showUndoToast } = useUndoToast();
  const { isPremium } = usePremium();
  const { runWithErrorAlert } = useErrorAlert();

  const confirmDeleteVisit = useCallback(() => {
    if (!selectedVisit) return;
    const visitId = selectedVisit.visit.id;
    Alert.alert(
      'この訪問記録を削除しますか？',
      '写真とメモも一緒に削除されます。元には戻せません。',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => {
            await runWithErrorAlert('削除できませんでした', async () => {
              const remaining = summary?.visits.filter((bundle) => bundle.visit.id !== visitId) ?? [];
              await removeVisit(visitId);
              if (remaining.length > 0) {
                setSelectedVisitId(remaining[0].visit.id);
              } else {
                router.back();
              }
            });
          },
        },
      ],
    );
  }, [removeVisit, router, runWithErrorAlert, selectedVisit, summary, setSelectedVisitId]);

  const openMoreMenu = useCallback(() => {
    Alert.alert(
      '操作',
      undefined,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: 'この訪問記録を削除',
          style: 'destructive',
          onPress: confirmDeleteVisit,
        },
      ],
    );
  }, [confirmDeleteVisit]);

  const handleDateChange = useCallback(
    async (_event: DateTimePickerEvent, next?: Date) => {
      if (!selectedVisit || !next) return;
      const iso = toISODate(next);
      if (iso === selectedVisit.visit.visitedAt) {
        setDatePickerOpen(false);
        return;
      }
      await runWithErrorAlert('日付を更新できませんでした', async () => {
        await updateVisitDate(selectedVisit.visit.id, iso);
        setDatePickerOpen(false);
      });
    },
    [runWithErrorAlert, selectedVisit, updateVisitDate, setDatePickerOpen],
  );

  // 都市の追加に成功したか（または空文字で何もしなかったか）を返す。
  // Enter 確定時に「成功したときだけ編集モードを抜ける」分岐に使う。
  const handleAddCity = useCallback(async (): Promise<boolean> => {
    if (!selectedVisit) return false;
    const trimmed = cityDraft.trim();
    if (!trimmed) {
      setCityInputOpen(false);
      return true;
    }
    const ok = await runWithErrorAlert('都市を追加できませんでした', async () => {
      await addCity(selectedVisit.visit.id, trimmed);
      setCityDraft('');
      setCityInputOpen(false);
      return true;
    });
    return ok ?? false;
  }, [addCity, cityDraft, runWithErrorAlert, selectedVisit, setCityDraft, setCityInputOpen]);

  const handleRemoveCity = useCallback(
    async (city: City) => {
      await runWithErrorAlert('都市を削除できませんでした', async () => {
        const removed = await removeCity(city.id);
        if (!removed) return;
        showUndoToast({
          label: `「${removed.name}」を削除しました`,
          onUndo: async () => {
            try {
              await restoreCity(removed);
            } catch {
              // 復元失敗時は黙る
            }
          },
        });
      });
    },
    [removeCity, restoreCity, runWithErrorAlert, showUndoToast],
  );

  const handlePickPhotos = useCallback(async () => {
    if (!selectedVisit) return;
    await runWithErrorAlert(
      '写真を追加できませんでした',
      async () => {
        const current = selectedVisit.photos.length;
        const result = await pickAndStoreVisitPhotos(current, isPremium);
        if (result.limitReached) {
          Alert.alert('写真の上限です', PREMIUM_PHOTO_LIMIT_REACHED_MESSAGE);
          return;
        }
        if (result.uris.length === 0) return;
        await addPhotosToVisit(selectedVisit.visit.id, result.uris);
      },
      {
        // 写真ピッカー〜保存までの失敗原因を後で追えるよう、警告ログを残しておく。
        onError: (caught) => console.warn('[country] handlePickPhotos failed', caught),
      },
    );
  }, [addPhotosToVisit, isPremium, runWithErrorAlert, selectedVisit]);

  const handleRemovePhoto = useCallback(
    async (photo: Photo) => {
      await runWithErrorAlert('写真を削除できませんでした', async () => {
        const removed = await removePhoto(photo.id);
        if (!removed) return;
        showUndoToast({
          label: '写真を削除しました',
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
            } catch {
              // ファイル削除失敗は黙る
            }
          },
        });
      });
    },
    [purgePhotoFile, removePhoto, restorePhoto, runWithErrorAlert, showUndoToast],
  );

  const handleAddMemo = useCallback(
    async (type: MemoType) => {
      if (!selectedVisit) return;
      await runWithErrorAlert('メモを追加できませんでした', async () => {
        const created = await addMemo(selectedVisit.visit.id, type, '');
        setMemoPickerOpen(false);
        setEditingMemoId(created.id);
        setMemoDraft('');
        setMemoFilter('all');
      });
    },
    [addMemo, runWithErrorAlert, selectedVisit, setEditingMemoId, setMemoDraft, setMemoFilter, setMemoPickerOpen],
  );

  const beginEditMemo = useCallback(
    (memo: MemoCard) => {
      setEditingMemoId(memo.id);
      setMemoDraft(memo.content);
    },
    [setEditingMemoId, setMemoDraft],
  );

  const handleSaveMemo = useCallback(
    async (memo: MemoCard) => {
      const next = memoDraft;
      setEditingMemoId(null);
      if (next === memo.content) return;
      await runWithErrorAlert('メモを保存できませんでした', async () => {
        await updateMemoContent(memo.id, next);
      });
    },
    [memoDraft, runWithErrorAlert, updateMemoContent, setEditingMemoId],
  );

  const handleRemoveMemo = useCallback(
    async (memo: MemoCard, close?: () => void) => {
      await runWithErrorAlert('メモを削除できませんでした', async () => {
        const removed = await removeMemo(memo.id);
        if (!removed) {
          close?.();
          return;
        }
        close?.();
        const definition = getMemoDefinition(removed.type);
        showUndoToast({
          label: `「${definition?.title ?? 'メモ'}」を削除しました`,
          onUndo: async () => {
            try {
              await restoreMemo(removed);
            } catch {
              // 復元失敗時は黙る
            }
          },
        });
      });
    },
    [removeMemo, restoreMemo, runWithErrorAlert, showUndoToast],
  );

  return {
    isPremium,
    confirmDeleteVisit,
    openMoreMenu,
    handleDateChange,
    handleAddCity,
    handleRemoveCity,
    handlePickPhotos,
    handleRemovePhoto,
    handleAddMemo,
    beginEditMemo,
    handleSaveMemo,
    handleRemoveMemo,
  };
}
