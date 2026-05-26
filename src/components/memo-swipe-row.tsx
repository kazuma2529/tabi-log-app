import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import ReanimatedSwipeable, { type SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';

import { getMemoDefinition } from '@/data';
import { colors, radius, shadows, spacing } from '@/theme';
import type { MemoCard } from '@/types';

type MemoSwipeRowProps = {
  memo: MemoCard;
  isEditing: boolean;
  draft: string;
  onStartEdit: (memo: MemoCard) => void;
  onChangeDraft: (text: string) => void;
  onSaveEdit: (memo: MemoCard) => void;
  onConfirmDelete: (memo: MemoCard, close: () => void) => void;
  registerRef?: (memoId: string, node: View | null) => void;
};

export function MemoSwipeRow({
  memo,
  isEditing,
  draft,
  onStartEdit,
  onChangeDraft,
  onSaveEdit,
  onConfirmDelete,
  registerRef,
}: MemoSwipeRowProps) {
  const swipeableRef = useRef<SwipeableMethods>(null);
  const definition = getMemoDefinition(memo.type);

  function close() {
    swipeableRef.current?.close();
  }

  // 編集モードに入ったら自動でスワイプを閉じる
  useEffect(() => {
    if (isEditing) {
      close();
    }
  }, [isEditing]);

  // unmount 時に親の参照を解放する。memo.id 単位で登録/解除されることを意図。
  useEffect(() => {
    return () => {
      registerRef?.(memo.id, null);
    };
  }, [memo.id, registerRef]);

  function renderRightActions() {
    return (
      <RectButton
        accessibilityRole="button"
        accessibilityLabel="このメモを削除"
        style={styles.deleteAction}
        onPress={() => onConfirmDelete(memo, close)}
      >
        <Text style={styles.deleteText}>削除</Text>
      </RectButton>
    );
  }

  return (
    <View
      ref={(node) => {
        registerRef?.(memo.id, node);
      }}
      style={styles.wrap}
    >
      <ReanimatedSwipeable
        ref={swipeableRef}
        enabled={!isEditing}
        renderRightActions={renderRightActions}
        overshootRight={false}
        friction={1.6}
        rightThreshold={40}
      >
        <View style={styles.row}>
          <View style={styles.iconBubble}>
            <Text style={styles.iconText}>{definition?.icon ?? '📝'}</Text>
          </View>
          <View style={styles.body}>
            {isEditing ? (
              <TextInput
                value={draft}
                onChangeText={onChangeDraft}
                autoFocus
                multiline
                maxLength={300}
                placeholder={definition?.placeholder ?? 'メモを入力'}
                placeholderTextColor={colors.textMuted}
                style={styles.input}
                textAlignVertical="top"
                onBlur={() => onSaveEdit(memo)}
              />
            ) : (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${definition?.title ?? 'メモ'} を編集`}
                onPress={() => onStartEdit(memo)}
                style={({ pressed }) => [styles.contentPressable, pressed && styles.pressed]}
              >
                <Text selectable style={memo.content ? styles.content : styles.empty} numberOfLines={4}>
                  {memo.content || 'タップして入力'}
                </Text>
              </Pressable>
            )}
          </View>
          {!isEditing ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${definition?.title ?? 'メモ'} を編集`}
              hitSlop={8}
              onPress={() => onStartEdit(memo)}
              style={styles.editHint}
            >
              <Ionicons name="pencil-outline" size={16} color={colors.textMuted} />
            </Pressable>
          ) : null}
        </View>
      </ReanimatedSwipeable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 250, 238, 0.94)',
    boxShadow: shadows.soft,
  },
  row: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.paper,
  },
  iconBubble: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderColor: colors.border,
    borderWidth: 1,
    marginTop: 1,
  },
  iconText: {
    fontSize: 16,
    lineHeight: 18,
  },
  body: {
    flex: 1,
  },
  contentPressable: {
    minHeight: 24,
    justifyContent: 'center',
  },
  content: {
    color: colors.textPrimary,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '400',
  },
  empty: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
    fontStyle: 'italic',
  },
  input: {
    minHeight: 64,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.accentTealDark,
    backgroundColor: colors.white,
    color: colors.textPrimary,
    fontSize: 14,
    lineHeight: 21,
  },
  editHint: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  pressed: {
    opacity: 0.82,
  },
  deleteAction: {
    width: 88,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.danger,
  },
  deleteText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '800',
  },
});
