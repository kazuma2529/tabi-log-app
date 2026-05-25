import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { MemoSwipeRow, PaperCard } from '@/components';
import { MEMO_CARD_DEFINITIONS } from '@/data';
import { colors, radius, spacing, text } from '@/theme';
import type { MemoCard, MemoType } from '@/types';

import { FilterChip } from './filter-chip';

export type MemoFilter = 'all' | MemoType;

type MemoSectionProps = {
  memos: MemoCard[];
  filter: MemoFilter;
  onChangeFilter: (filter: MemoFilter) => void;
  onOpenPicker: () => void;
  editingMemoId: string | null;
  memoDraft: string;
  onStartEdit: (memo: MemoCard) => void;
  onChangeDraft: (text: string) => void;
  onSaveEdit: (memo: MemoCard) => void;
  onConfirmDelete: (memo: MemoCard, close: () => void) => void;
  registerMemoRef: (memoId: string, node: View | null) => void;
};

export function MemoSection({
  memos,
  filter,
  onChangeFilter,
  onOpenPicker,
  editingMemoId,
  memoDraft,
  onStartEdit,
  onChangeDraft,
  onSaveEdit,
  onConfirmDelete,
  registerMemoRef,
}: MemoSectionProps) {
  return (
    <PaperCard inset style={styles.section}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="document-text-outline" size={18} color={colors.textPrimary} />
          <Text selectable style={styles.title}>
            メモ
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="メモを追加"
          hitSlop={6}
          style={styles.addChip}
          onPress={onOpenPicker}
        >
          <Ionicons name="add" size={14} color={colors.accentTealDark} />
          <Text selectable style={styles.addChipText}>
            メモを追加
          </Text>
        </Pressable>
      </View>

      <Text selectable style={styles.filterLabel}>
        フィルター
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        style={styles.filterScroll}
      >
        <FilterChip
          label="すべて"
          active={filter === 'all'}
          onPress={() => onChangeFilter('all')}
        />
        {MEMO_CARD_DEFINITIONS.map((def) => (
          <FilterChip
            key={def.type}
            icon={def.icon}
            label={def.title}
            active={filter === def.type}
            onPress={() => onChangeFilter(def.type)}
          />
        ))}
      </ScrollView>

      {memos.length > 0 ? (
        <View style={styles.list}>
          {memos.map((memo) => (
            <MemoSwipeRow
              key={memo.id}
              memo={memo}
              isEditing={editingMemoId === memo.id}
              draft={memoDraft}
              onStartEdit={onStartEdit}
              onChangeDraft={onChangeDraft}
              onSaveEdit={onSaveEdit}
              onConfirmDelete={(target, close) => onConfirmDelete(target, close)}
              registerRef={registerMemoRef}
            />
          ))}
        </View>
      ) : (
        <View style={styles.emptyBlock}>
          <Text selectable style={styles.emptyText}>
            {filter === 'all'
              ? 'まだメモがありません。右上の「メモを追加」から記録できます。'
              : 'このタグのメモはまだありません。'}
          </Text>
        </View>
      )}
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
  addChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 32,
    paddingHorizontal: spacing.md,
    borderRadius: radius.round,
    borderWidth: 1,
    borderColor: colors.accentTealDark,
    backgroundColor: 'rgba(47, 155, 145, 0.08)',
  },
  addChipText: {
    color: colors.accentTealDark,
    fontSize: 13,
    fontWeight: '800',
  },
  filterLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '800',
  },
  filterScroll: {
    marginHorizontal: -spacing.lg,
  },
  filterRow: {
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  list: {
    gap: spacing.sm,
  },
  emptyBlock: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(255, 250, 238, 0.6)',
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
});
