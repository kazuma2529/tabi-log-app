import { useCallback, useEffect, useRef } from 'react';
import { type NativeScrollEvent, type NativeSyntheticEvent, type ScrollView, View } from 'react-native';

/**
 * メモが編集状態になったときに、その行をキーボード上にスクロールさせるための補助 hook。
 *
 * 新アーキテクチャ（Fabric）では `measureLayout` の第1引数が厳しくなるため、
 * `measure()` で screen Y を取り、現在のスクロールオフセットと組み合わせてスクロール先を計算する。
 */
export function useMemoAutoscroll(editingMemoId: string | null) {
  const scrollViewRef = useRef<ScrollView | null>(null);
  const memoRowRefs = useRef<Map<string, View>>(new Map());
  const scrollOffsetRef = useRef(0);

  const registerMemoRef = useCallback((memoId: string, node: View | null) => {
    if (node) {
      memoRowRefs.current.set(memoId, node);
    } else {
      memoRowRefs.current.delete(memoId);
    }
  }, []);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollOffsetRef.current = event.nativeEvent.contentOffset.y;
  }, []);

  useEffect(() => {
    if (!editingMemoId) return;
    const scrollViewNode = scrollViewRef.current;
    if (!scrollViewNode) return;

    // 新規追加直後は layout が確定するまでに時間がかかるので少し待つ。
    const timer = setTimeout(() => {
      const rowNode = memoRowRefs.current.get(editingMemoId);
      if (!rowNode || typeof rowNode.measure !== 'function') return;
      rowNode.measure((_x, _y, _width, _height, _pageX, pageY) => {
        // 行の上端を画面上部から 140px のあたりに置き、キーボード上に確実に見える位置にする。
        const desiredScreenY = 140;
        const delta = pageY - desiredScreenY;
        const nextOffset = Math.max(0, scrollOffsetRef.current + delta);
        scrollViewNode.scrollTo({ y: nextOffset, animated: true });
      });
    }, 180);

    return () => clearTimeout(timer);
  }, [editingMemoId]);

  return {
    scrollViewRef,
    registerMemoRef,
    handleScroll,
  };
}
