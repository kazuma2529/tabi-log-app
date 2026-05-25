import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PaperCard } from '@/components';
import { colors, radius, spacing, text } from '@/theme';
import type { Photo } from '@/types';

type PhotoSectionProps = {
  visiblePhotos: Photo[];
  hasOverflow: boolean;
  showAll: boolean;
  onToggleShowAll: () => void;
  onPickPhotos: () => void;
  onRemovePhoto: (photo: Photo) => void;
};

export function PhotoSection({
  visiblePhotos,
  hasOverflow,
  showAll,
  onToggleShowAll,
  onPickPhotos,
  onRemovePhoto,
}: PhotoSectionProps) {
  return (
    <PaperCard inset style={styles.section}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="image-outline" size={18} color={colors.textPrimary} />
          <Text selectable style={styles.title}>
            写真
          </Text>
        </View>
        {hasOverflow ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={showAll ? '写真の表示を折りたたむ' : 'すべての写真を見る'}
            hitSlop={6}
            onPress={onToggleShowAll}
          >
            <Text selectable style={styles.seeAll}>
              {showAll ? '折りたたむ' : `すべてを見る ›`}
            </Text>
          </Pressable>
        ) : null}
      </View>
      {visiblePhotos.length > 0 ? (
        <View style={styles.grid}>
          {visiblePhotos.map((photo) => (
            <View key={photo.id} style={styles.tile}>
              <Image source={{ uri: photo.uri }} style={styles.image} contentFit="cover" />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="写真を削除"
                style={styles.delete}
                hitSlop={6}
                onPress={() => onRemovePhoto(photo)}
              >
                <Ionicons name="close" size={14} color={colors.textPrimary} />
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="写真を追加"
        style={styles.addButton}
        onPress={onPickPhotos}
      >
        <Ionicons name="add" size={18} color={colors.accentTealDark} />
        <Text selectable style={styles.addLabel}>
          写真を追加
        </Text>
      </Pressable>
    </PaperCard>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: text.sectionTitle,
  seeAll: {
    color: colors.accentTealDark,
    fontSize: 13,
    fontWeight: '800',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tile: {
    width: '31.5%',
    overflow: 'hidden',
    borderRadius: radius.md,
    backgroundColor: colors.paperDeep,
    borderColor: colors.border,
    borderWidth: 1,
  },
  // 親 View に aspectRatio を持たせて absoluteFill で Image を貼る方式だと、
  // 一部の環境（新アーキ含む）で Image が measurement 0 で読み込みを諦めるケースが
  // あるため、Image 自身に幅と aspectRatio を持たせる。
  image: {
    width: '100%',
    aspectRatio: 1,
  },
  delete: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(255, 248, 234, 0.92)',
    borderColor: colors.border,
    borderWidth: 1,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    minHeight: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.accentTealDark,
    backgroundColor: 'rgba(47, 155, 145, 0.06)',
  },
  addLabel: {
    color: colors.accentTealDark,
    fontSize: 13,
    fontWeight: '800',
  },
});
