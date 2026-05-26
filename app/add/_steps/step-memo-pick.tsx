import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components';
import { MEMO_CARD_DEFINITIONS } from '@/data';
import { colors, radius, shadows, spacing } from '@/theme';
import type { MemoType } from '@/types';

type StepMemoPickProps = {
  selectedMemoTypes: MemoType[];
  onToggleMemo: (type: MemoType) => void;
  onNext: () => void;
};

export function StepMemoPick({ selectedMemoTypes, onToggleMemo, onNext }: StepMemoPickProps) {
  return (
    <View style={styles.block}>
      <Text selectable style={styles.helper}>
        記録したい内容だけ選んでください。{'\n'}何も選ばなくても保存できます。
      </Text>
      <View style={styles.memoGrid}>
        {MEMO_CARD_DEFINITIONS.map((memo) => {
          const selected = selectedMemoTypes.includes(memo.type);
          return (
            <Pressable
              key={memo.type}
              style={[styles.memoOption, selected && styles.memoOptionSelected]}
              onPress={() => onToggleMemo(memo.type)}
            >
              <Text style={styles.memoIcon}>{memo.icon}</Text>
              <Text selectable style={styles.memoOptionText}>
                {memo.title}
              </Text>
            </Pressable>
          );
        })}
      </View>
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
  memoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  memoOption: {
    width: '47.8%',
    minHeight: 110,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    borderColor: colors.border,
    borderWidth: 1,
    backgroundColor: colors.paper,
    boxShadow: shadows.soft,
  },
  memoOptionSelected: {
    borderColor: colors.accentTeal,
    backgroundColor: '#E7F5F1',
  },
  memoIcon: {
    fontSize: 30,
  },
  memoOptionText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 18,
  },
});
