import { StyleSheet, Text, TextInput, View } from 'react-native';

import { EmptyState, PaperCard, PrimaryButton } from '@/components';
import { MEMO_CARD_DEFINITIONS } from '@/data';
import { colors, radius, spacing } from '@/theme';
import type { MemoType } from '@/types';

type StepMemoFillProps = {
  selectedMemoTypes: MemoType[];
  memoContents: Record<MemoType, string>;
  onChangeMemoContent: (type: MemoType, content: string) => void;
  isSaving: boolean;
  onSave: () => void;
};

export function StepMemoFill({
  selectedMemoTypes,
  memoContents,
  onChangeMemoContent,
  isSaving,
  onSave,
}: StepMemoFillProps) {
  return (
    <View style={styles.block}>
      {selectedMemoTypes.length > 0 ? (
        selectedMemoTypes.map((type) => {
          const definition = MEMO_CARD_DEFINITIONS.find((memo) => memo.type === type);
          if (!definition) {
            return null;
          }

          return (
            <PaperCard key={type} inset style={styles.memoInputCard}>
              <Text selectable style={styles.memoInputTitle}>
                {definition.icon} {definition.title}
              </Text>
              <TextInput
                value={memoContents[type]}
                onChangeText={(content) => onChangeMemoContent(type, content)}
                placeholder={definition.placeholder}
                multiline
                maxLength={300}
                style={styles.memoInput}
                textAlignVertical="top"
              />
              <Text selectable style={styles.counter}>
                {(memoContents[type] ?? '').length}/300
              </Text>
            </PaperCard>
          );
        })
      ) : (
        <EmptyState
          icon="📝"
          title="メモなしで登録します"
          body="メモは完全任意です。登録後の詳細画面には空欄カードを表示しません。"
        />
      )}
      <PrimaryButton label="登録する" loading={isSaving} onPress={onSave} />
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: spacing.md,
  },
  memoInputCard: {
    gap: spacing.sm,
  },
  memoInputTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '900',
  },
  memoInput: {
    minHeight: 116,
    borderRadius: radius.md,
    borderColor: colors.border,
    borderWidth: 1,
    backgroundColor: colors.white,
    padding: spacing.md,
    color: colors.textPrimary,
    fontSize: 14,
    lineHeight: 20,
  },
  counter: {
    color: colors.textMuted,
    fontSize: 11,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
});
