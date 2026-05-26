import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { MEMO_CARD_DEFINITIONS } from '@/data';
import { colors, radius, shadows, spacing } from '@/theme';
import type { MemoType } from '@/types';

type MemoPickerModalProps = {
  visible: boolean;
  onClose: () => void;
  onPick: (type: MemoType) => void;
};

export function MemoPickerModal({ visible, onClose, onPick }: MemoPickerModalProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.handle} />
          <Text selectable style={styles.title}>
            追加するメモを選ぶ
          </Text>
          <View style={styles.grid}>
            {MEMO_CARD_DEFINITIONS.map((def) => (
              <Pressable
                key={def.type}
                style={styles.tile}
                onPress={() => onPick(def.type)}
              >
                <Text style={styles.tileIcon}>{def.icon}</Text>
                <Text selectable style={styles.tileText}>
                  {def.title}
                </Text>
              </Pressable>
            ))}
          </View>
          <Pressable
            accessibilityRole="button"
            style={styles.cancel}
            onPress={onClose}
          >
            <Text style={styles.cancelText}>キャンセル</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(40, 24, 8, 0.36)',
    justifyContent: 'flex-end',
  },
  sheet: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    gap: spacing.lg,
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  tile: {
    width: '47.8%',
    minHeight: 100,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radius.md,
    borderColor: colors.border,
    borderWidth: 1,
    backgroundColor: colors.paper,
    boxShadow: shadows.soft,
  },
  tileIcon: {
    fontSize: 28,
  },
  tileText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 18,
  },
  cancel: {
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: radius.round,
    backgroundColor: colors.paper,
    borderColor: colors.border,
    borderWidth: 1,
  },
  cancelText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '800',
  },
});
