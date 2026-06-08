import { useLocalSearchParams, useRouter } from 'expo-router';

import { AppScreen, BackIconButton, EmptyState, PrimaryButton } from '@/components';
import { useCountryVisitMedia } from '@/features/country-detail/hooks/use-country-visit-media';
import { VisitMediaAlbumScreen, VisitMediaPreviewModal } from '@/features/visit-media';
import { useTravel } from '@/hooks';

export default function VisitMediaAlbumRoute() {
  const router = useRouter();
  const params = useLocalSearchParams<{ countryId: string; visitId?: string }>();
  const { isReady: isTravelReady } = useTravel();
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

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  if (!isTravelReady) {
    return (
      <AppScreen title="アルバム" left={<BackIconButton onPress={goBack} />}>
        <EmptyState icon="📷" title="アルバムを読み込んでいます" body="少しお待ちください。" />
      </AppScreen>
    );
  }

  if (!isReady || !country || !visitBundle) {
    return (
      <AppScreen title="アルバム" left={<BackIconButton onPress={goBack} />}>
        <EmptyState
          icon="📷"
          title="アルバムが見つかりません"
          body="訪問記録が削除されたか、URLが正しくない可能性があります。"
        />
        <PrimaryButton label="ホームへ戻る" onPress={() => router.replace('/')} />
      </AppScreen>
    );
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
