import { useCallback, useRef } from 'react';
import type { LayoutChangeEvent, LayoutRectangle } from 'react-native';
import { View } from 'react-native';

export function useMeasureInWindow(onMeasured: (rect: LayoutRectangle) => void) {
  const ref = useRef<View>(null);

  const onLayout = useCallback(
    (_event: LayoutChangeEvent) => {
      // onLayout は親基準の座標なので、画面座標系で判定できるよう measureInWindow を使う。
      ref.current?.measureInWindow((x, y, width, height) => {
        if (!width || !height) return;
        onMeasured({ x, y, width, height });
      });
    },
    [onMeasured],
  );

  return { ref, onLayout };
}

