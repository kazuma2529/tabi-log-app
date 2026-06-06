import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, radius } from '@/theme';
import type { VisitMedia } from '@/types';

import { getDisplayUri } from './utils';

type VisitMediaThumbnailProps = {
  media: VisitMedia;
  onPress?: () => void;
  onLongPress?: () => void;
  style?: object;
  aspectRatio?: number;
};

export function VisitMediaThumbnail({
  media,
  onPress,
  onLongPress,
  style,
  aspectRatio = 1,
}: VisitMediaThumbnailProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={media.mediaType === 'video' ? '動画を表示' : '写真を表示'}
      style={[styles.tile, style]}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={320}
    >
      <Image
        source={{ uri: getDisplayUri(media) }}
        style={[styles.image, { aspectRatio }]}
        contentFit="cover"
      />
      {media.mediaType === 'video' ? (
        <View style={styles.playBadge}>
          <Ionicons name="play" size={18} color="#fff" />
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    overflow: 'hidden',
    borderRadius: radius.md,
    backgroundColor: colors.paperDeep,
    borderColor: colors.border,
    borderWidth: 1,
  },
  image: {
    width: '100%',
  },
  playBadge: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.22)',
  },
});
