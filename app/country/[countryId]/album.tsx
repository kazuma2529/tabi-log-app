import { useLocalSearchParams } from 'expo-router';

import { VisitMediaAlbumScreen, VisitMediaPreviewModal } from '@/features/visit-media';

import { useCountryVisitMedia } from './_hooks/use-country-visit-media';

export default function VisitMediaAlbumRoute() {
  const params = useLocalSearchParams<{ countryId: string; visitId?: string }>();
  const {
    country,
    visitBundle,
    visitOrdinal,
    media,
    previewIndex,
    setPreviewIndex,
    mediaActions,
    isReady,
  } = useCountryVisitMedia({
    countryId: params.countryId,
    visitId: params.visitId,
  });

  if (!isReady || !country || !visitBundle) {
    return null;
  }

  return (
    <>
      <VisitMediaAlbumScreen
        country={country}
        visitOrdinal={visitOrdinal}
        media={media}
        onPressMedia={(_item, index) => setPreviewIndex(index)}
        onDeleteMedia={mediaActions.handleRemoveMedia}
        onReorder={mediaActions.handleReorder}
        onPickMedia={mediaActions.handlePickMedia}
      />
      <VisitMediaPreviewModal
        visible={previewIndex !== null}
        media={media}
        initialIndex={previewIndex ?? 0}
        onClose={() => setPreviewIndex(null)}
      />
    </>
  );
}
