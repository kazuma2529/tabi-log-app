import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { EmptyState, PrimaryButton } from '@/components';
import { FREE_PHOTO_LIMIT } from '@/constants';
import { PREMIUM_MEDIA_LIMIT_BODY } from '@/lib';
import { colors, radius, spacing } from '@/theme';
import type { StoredVisitMediaInput } from '@/types';

type StepPhotosProps = {
  isPremium: boolean;
  mediaItems: StoredVisitMediaInput[];
  onPickPhotos: () => void;
  onRemovePhoto: (uri: string) => void;
  onNext: () => void;
};

export function StepPhotos({ isPremium, mediaItems, onPickPhotos, onRemovePhoto, onNext }: StepPhotosProps) {
  return (
    <View style={styles.block}>
      <Text selectable style={styles.helper}>
        {isPremium
          ? 'プレミアムでは、写真や動画を無制限に追加できます。'
          : mediaItems.length >= FREE_PHOTO_LIMIT
            ? PREMIUM_MEDIA_LIMIT_BODY
            : `無料版では10枚まできれいに表示。あと${Math.max(FREE_PHOTO_LIMIT - mediaItems.length, 0)}件追加できます。`}
      </Text>
      {mediaItems.length > 0 ? (
        <View style={styles.photoGrid}>
          {mediaItems.map((item) => (
            <View key={item.uri} style={styles.photoThumb}>
              <Image source={{ uri: item.thumbnailUri ?? item.uri }} style={styles.photoImage} contentFit="cover" />
              {item.mediaType === 'video' ? (
                <View style={styles.videoBadge}>
                  <Ionicons name="videocam" size={12} color={colors.white} />
                  <Text style={styles.videoBadgeText}>動画</Text>
                </View>
              ) : null}
              <Pressable style={styles.removePhoto} onPress={() => onRemovePhoto(item.uri)}>
                <Ionicons name="close" size={14} color={colors.textPrimary} />
              </Pressable>
            </View>
          ))}
        </View>
      ) : (
        <EmptyState
          icon="📷"
          title="写真なしでも保存できます"
          body="写真は後から対応しやすいよう、訪問回ごとに分けて保存します。"
        />
      )}
      <Pressable style={styles.addPhotoBox} onPress={onPickPhotos}>
        <Ionicons name="add-circle-outline" size={28} color={colors.accentTealDark} />
        <Text selectable style={styles.addPhotoText}>
          写真や動画を追加
        </Text>
      </Pressable>
      <PrimaryButton label="次へ" onPress={onNext} />
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: spacing.md,
  },
  helper: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  photoThumb: {
    width: '30.9%',
    overflow: 'hidden',
    borderRadius: radius.md,
    backgroundColor: colors.paperDeep,
    borderColor: colors.border,
    borderWidth: 1,
  },
  // 親 View に aspectRatio を持たせて absoluteFill で Image を貼る方式だと、
  // 一部の環境（新アーキ含む）で Image が measurement 0 で読み込みを諦めるケースが
  // あるため、Image 自身に幅と aspectRatio を持たせる。
  photoImage: {
    width: '100%',
    aspectRatio: 1,
  },
  removePhoto: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(255, 248, 234, 0.9)',
  },
  videoBadge: {
    position: 'absolute',
    left: 5,
    bottom: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: radius.round,
    backgroundColor: 'rgba(53, 35, 16, 0.72)',
  },
  videoBadgeText: {
    color: colors.white,
    fontSize: 9,
    fontWeight: '900',
  },
  addPhotoBox: {
    minHeight: 92,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    backgroundColor: 'rgba(255, 250, 238, 0.72)',
  },
  addPhotoText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '800',
  },
});
