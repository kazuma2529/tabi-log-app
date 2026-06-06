import { Ionicons } from '@expo/vector-icons';
import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { radius, spacing } from '@/theme';

import { useMeasureInWindow } from './measure-in-window';

type TrashDropZoneProps = {
  visible: boolean;
  isActive: boolean;
  onMeasured: (rect: { x: number; y: number; width: number; height: number }) => void;
  variant?: 'section' | 'album';
  containerStyle?: object;
};

const DELETE_RED = '#B71C1C';
const DELETE_RED_ACTIVE = '#6D0000';

export const TrashDropZone = memo(function TrashDropZone({
  visible,
  isActive,
  onMeasured,
  variant = 'section',
  containerStyle,
}: TrashDropZoneProps) {
  const { ref, onLayout } = useMeasureInWindow(onMeasured);

  if (!visible) return null;

  const isAlbum = variant === 'album';

  return (
    <View
      ref={ref}
      onLayout={onLayout}
      pointerEvents="none"
      accessibilityRole="button"
      accessibilityLabel="ここにドラッグして削除"
      style={[
        isAlbum ? styles.albumButton : styles.sectionButton,
        containerStyle,
        isActive && (isAlbum ? styles.albumButtonActive : styles.sectionButtonActive),
      ]}
    >
      <Ionicons
        name="trash-outline"
        size={isAlbum ? 20 : 18}
        color={isActive ? DELETE_RED_ACTIVE : DELETE_RED}
      />
      <Text
        selectable={false}
        style={[
          isAlbum ? styles.albumLabel : styles.sectionLabel,
          isActive && (isAlbum ? styles.albumLabelActive : styles.sectionLabelActive),
        ]}
      >
        削除
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  sectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    minHeight: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: DELETE_RED,
    backgroundColor: 'rgba(183, 28, 28, 0.08)',
  },
  sectionButtonActive: {
    borderColor: DELETE_RED_ACTIVE,
    backgroundColor: 'rgba(109, 0, 0, 0.14)',
  },
  sectionLabel: {
    color: DELETE_RED,
    fontSize: 13,
    fontWeight: '800',
  },
  sectionLabelActive: {
    color: DELETE_RED_ACTIVE,
  },
  albumButton: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: DELETE_RED,
    backgroundColor: 'rgba(255, 232, 234, 0.94)',
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  albumButtonActive: {
    borderColor: DELETE_RED_ACTIVE,
    backgroundColor: 'rgba(255, 205, 210, 0.97)',
  },
  albumLabel: {
    color: DELETE_RED,
    fontSize: 14,
    fontWeight: '800',
  },
  albumLabelActive: {
    color: DELETE_RED_ACTIVE,
  },
});
