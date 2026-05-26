import { useState, type Dispatch, type SetStateAction } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import {
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const MIN_SCALE = 1;
const MAX_SCALE = 6;

/**
 * 世界地図の pan / pinch ズームを共有値ベースで扱う hook。
 * 旧 `world-map.tsx` 内に書かれていた計算ロジックをそのまま移しただけで、挙動は変えない。
 */
export function useWorldMapZoom() {
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const lastPinchScale = useSharedValue(1);
  const lastPanX = useSharedValue(0);
  const lastPanY = useSharedValue(0);
  const viewWidth = useSharedValue(0);
  const viewHeight = useSharedValue(0);

  const [isZoomed, setIsZoomed] = useState(false);
  const setIsZoomedSafe: Dispatch<SetStateAction<boolean>> = setIsZoomed;

  useAnimatedReaction(
    () => scale.value > 1.01,
    (current, previous) => {
      if (current !== previous) {
        runOnJS(setIsZoomedSafe)(current);
      }
    },
  );

  function handleResetZoom() {
    scale.value = withTiming(1, { duration: 220 });
    translateX.value = withTiming(0, { duration: 220 });
    translateY.value = withTiming(0, { duration: 220 });
  }

  function onLayout(event: { nativeEvent: { layout: { width: number; height: number } } }) {
    viewWidth.value = event.nativeEvent.layout.width;
    viewHeight.value = event.nativeEvent.layout.height;
  }

  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      lastPinchScale.value = 1;
    })
    .onUpdate((e) => {
      const increment = e.scale / lastPinchScale.value;
      lastPinchScale.value = e.scale;

      const target = scale.value * increment;
      const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, target));
      if (newScale === scale.value) {
        return;
      }

      const ratio = newScale / scale.value;
      const focalX = e.focalX;
      const focalY = e.focalY;
      const nextTx = focalX - ratio * (focalX - translateX.value);
      const nextTy = focalY - ratio * (focalY - translateY.value);

      const w = viewWidth.value;
      const h = viewHeight.value;
      const minTx = -(newScale - 1) * w;
      const minTy = -(newScale - 1) * h;

      scale.value = newScale;
      translateX.value = Math.min(0, Math.max(minTx, nextTx));
      translateY.value = Math.min(0, Math.max(minTy, nextTy));
    });

  const panGesture = Gesture.Pan()
    .minDistance(8)
    .minPointers(1)
    .maxPointers(2)
    .onStart((e) => {
      lastPanX.value = e.translationX;
      lastPanY.value = e.translationY;
    })
    .onUpdate((e) => {
      const dx = e.translationX - lastPanX.value;
      const dy = e.translationY - lastPanY.value;
      lastPanX.value = e.translationX;
      lastPanY.value = e.translationY;

      const s = scale.value;
      const w = viewWidth.value;
      const h = viewHeight.value;
      const minTx = -(s - 1) * w;
      const minTy = -(s - 1) * h;

      translateX.value = Math.min(0, Math.max(minTx, translateX.value + dx));
      translateY.value = Math.min(0, Math.max(minTy, translateY.value + dy));
    });

  const composedGesture = Gesture.Simultaneous(pinchGesture, panGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return {
    isZoomed,
    composedGesture,
    animatedStyle,
    onLayout,
    handleResetZoom,
  };
}
