import type { VisitMedia } from '@/types';

import type { DragTargetsApi } from './types';

type HandleOutsideDropOptions = {
  dragged: VisitMedia | null;
  targets: Pick<DragTargetsApi, 'over'>;
  onDelete: (media: VisitMedia) => void;
  onMoveToFeatured?: (dragged: VisitMedia) => void;
};

export function handleOutsideDrop({
  dragged,
  targets,
  onDelete,
  onMoveToFeatured,
}: HandleOutsideDropOptions) {
  if (!dragged) return;
  if (targets.over.featured && onMoveToFeatured) {
    onMoveToFeatured(dragged);
    return;
  }
  if (targets.over.trash) {
    onDelete(dragged);
  }
}
