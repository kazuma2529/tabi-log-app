import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { EmptyState, PrimaryButton } from '@/components';
import { FREE_PHOTO_LIMIT } from '@/constants';
import { PREMIUM_UNLOCK_SHORT_COPY } from '@/lib';
import { colors, radius, spacing } from '@/theme';

type StepPhotosProps = {
  isPremium: boolean;
  photoUris: string[];
  onPickPhotos: () => void;
  onRemovePhoto: (uri: string) => void;
  onNext: () => void;
};

export function StepPhotos({ isPremium, photoUris, onPickPhotos, onRemovePhoto, onNext }: StepPhotosProps) {
  return (
    <View style={styles.block}>
      <Text selectable style={styles.helper}>
        {isPremium
          ? '有料版扱いのため写真は無制限で追加できます。'
          : photoUris.length >= FREE_PHOTO_LIMIT
            ? PREMIUM_UNLOCK_SHORT_COPY
            : `あと${Math.max(FREE_PHOTO_LIMIT - photoUris.length, 0)}枚まで追加できます（無料プラン）。`}
      </Text>
      {photoUris.length > 0 ? (
        <View style={styles.photoGrid}>
          {photoUris.map((uri) => (
            <View key={uri} style={styles.photoThumb}>
              <Image source={{ uri }} style={styles.photoImage} contentFit="cover" />
              <Pressable style={styles.removePhoto} onPress={() => onRemovePhoto(uri)}>
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
          写真を追加
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
