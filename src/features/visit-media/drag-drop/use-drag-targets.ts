import { useCallback, useRef, useState } from 'react';
import type { LayoutRectangle } from 'react-native';

export type DragPoint = {
  absoluteX: number;
  absoluteY: number;
};

type TargetKey = 'trash' | 'featured';

type TargetsState = Partial<Record<TargetKey, LayoutRectangle>>;

export function useDragTargets() {
  const targetsRef = useRef<TargetsState>({});
  const [over, setOver] = useState<Partial<Record<TargetKey, boolean>>>({});

  const setTarget = useCallback((key: TargetKey, rect: LayoutRectangle) => {
    targetsRef.current[key] = rect;
  }, []);

  const isOverTarget = useCallback((key: TargetKey, point: DragPoint) => {
    const rect = targetsRef.current[key];
    if (!rect) return false;
    return (
      point.absoluteX >= rect.x &&
      point.absoluteX <= rect.x + rect.width &&
      point.absoluteY >= rect.y &&
      point.absoluteY <= rect.y + rect.height
    );
  }, []);

  const updateOver = useCallback(
    (point: DragPoint | null) => {
      if (!point) {
        setOver({});
        return;
      }
      const next = {
        trash: isOverTarget('trash', point),
        featured: isOverTarget('featured', point),
      };
      setOver((prev) =>
        prev.trash === next.trash && prev.featured === next.featured ? prev : next,
      );
    },
    [isOverTarget],
  );

  return {
    setTarget,
    isOverTarget,
    over,
    updateOver,
    clearOver: () => setOver({}),
  };
}

