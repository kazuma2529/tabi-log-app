import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppScreen, EmptyState } from '@/components';
import { colors, shadows, spacing, text } from '@/theme';
import type { Country, VisitMedia } from '@/types';

import { TrashDropZone } from './drag-drop/trash-drop-zone';
import { useDragTargets } from './drag-drop/use-drag-targets';
import { countMediaByType, formatMediaCountLabel } from './utils';
import { VisitMediaAddButton } from './visit-media-add-button';
import { VisitMediaAlbumGrid } from './visit-media-album-grid';

type VisitMediaAlbumScreenProps = {
  country: Country;
  visitOrdinal: number;
  media: VisitMedia[];
  onPressMedia: (media: VisitMedia, index: number) => void;
  onDeleteMedia: (media: VisitMedia) => void;
  onReorder: (ordered: VisitMedia[]) => void;
  onPickMedia: () => void;
};

export function VisitMediaAlbumScreen({
  country,
  visitOrdinal,
  media,
  onPressMedia,
  onDeleteMedia,
  onReorder,
  onPickMedia,
}: VisitMediaAlbumScreenProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const targets = useDragTargets();
  const [dragging, setDragging] = useState(false);
  const [overTrash, setOverTrash] = useState(false);
  const { imageCount, videoCount } = countMediaByType(media);

  return (
    <AppScreen
      backgroundImage={require('../../../assets/images/album-paper-background.jpg')}
      backgroundImageWashOpacity={0}
      footerOverlay={
        <View
          pointerEvents="box-none"
          style={[
            styles.footerOverlay,
            { paddingBottom: Math.max(insets.bottom, spacing.md) },
          ]}
        >
          <TrashDropZone
            variant="album"
            visible={dragging}
            isActive={overTrash}
            containerStyle={styles.trashInline}
            onMeasured={(rect) => targets.setTarget('trash', rect)}
          />
          <VisitMediaAddButton variant="album" style={styles.addButton} onPress={onPickMedia} />
        </View>
      }
    >
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="戻る"
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.back}>‹ 戻る</Text>
        </Pressable>

        <Text selectable style={styles.title}>
          思い出の写真
        </Text>

        <View style={styles.headerMeta}>
          <Text selectable style={styles.subtitle}>
            {country.nameJa}・{visitOrdinal}回目
          </Text>
          <Text selectable style={styles.counts}>
            {formatMediaCountLabel(imageCount, videoCount)}
          </Text>
        </View>
      </View>

      {media.length === 0 ? (
        <EmptyState icon="📷" title="まだ思い出がありません" body="国詳細画面から写真や動画を追加できます。" />
      ) : (
        <VisitMediaAlbumGrid
          media={media}
          onPressMedia={onPressMedia}
          onReorder={onReorder}
          onDeleteMedia={onDeleteMedia}
          targets={targets}
          onDragStateChange={({ dragging: nextDragging, overTrash: nextOverTrash }) => {
            setDragging(nextDragging);
            setOverTrash(nextOverTrash);
          }}
        />
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    paddingTop: spacing.xs,
    paddingBottom: spacing.md,
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  back: {
    color: colors.accentTealDark,
    fontSize: 15,
    fontWeight: '700',
  },
  title: {
    ...text.screenTitle,
    marginTop: spacing.xs,
    marginBottom: spacing.sm, // タイトル直下の余白
  },
  headerMeta: {
    alignItems: 'center',
    gap: 2,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: '700',
  },
  counts: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  footerOverlay: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: 0,
    pointerEvents: 'box-none',
    gap: 8,
  },
  trashInline: {
    // 追加ボタン直上に「少し隙間」で揃える（国詳細寄せ）
  },
  addButton: {
    boxShadow: shadows.soft,
  },
});
