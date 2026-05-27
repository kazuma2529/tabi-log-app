import { useCallback } from 'react';
import { Alert } from 'react-native';

const FALLBACK_MESSAGE = 'もう一度お試しください。';

type RunWithErrorAlertOptions = {
  onError?: (caught: unknown) => void;
};

/**
 * 「try / catch して Alert.alert(title, error.message ?? フォールバック) する」という
 * ミューテーション系ハンドラーで頻出するパターンを集約するフック。
 *
 * 文言とフォールバックメッセージはリファクタ前と完全一致。
 * onError は console.warn など catch 時の追加副作用が必要な箇所だけ渡す。
 */
export function useErrorAlert() {
  const runWithErrorAlert = useCallback(
    async <T>(
      title: string,
      action: () => Promise<T> | T,
      options?: RunWithErrorAlertOptions,
    ): Promise<T | undefined> => {
      try {
        return await action();
      } catch (caught) {
        options?.onError?.(caught);
        Alert.alert(title, caught instanceof Error ? caught.message : FALLBACK_MESSAGE);
        return undefined;
      }
    },
    [],
  );

  return { runWithErrorAlert };
}
