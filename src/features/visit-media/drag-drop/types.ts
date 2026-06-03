import type { LayoutRectangle } from 'react-native';

import type { DragPoint } from './use-drag-targets';

export type DragTargetKey = 'trash' | 'featured';

export type DragTargetsApi = {
  setTarget: (key: DragTargetKey, rect: LayoutRectangle) => void;
  isOverTarget: (key: DragTargetKey, point: DragPoint) => boolean;
  over: Partial<Record<DragTargetKey, boolean>>;
  updateOver: (point: DragPoint | null) => void;
  clearOver: () => void;
};
