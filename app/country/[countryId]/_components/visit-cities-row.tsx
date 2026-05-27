import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { colors, radius, spacing } from '@/theme';
import type { City } from '@/types';

type VisitCitiesRowProps = {
  cities: City[];
  isCityEditing: boolean;
  isCityInputOpen: boolean;
  cityDraft: string;
  onChangeCityDraft: (value: string) => void;
  onToggleCityEditing: () => void;
  onOpenCityInput: () => void;
  onAddCity: () => void;
  onSubmitCity: () => void;
  onRemoveCity: (city: City) => void;
};

export function VisitCitiesRow({
  cities,
  isCityEditing,
  isCityInputOpen,
  cityDraft,
  onChangeCityDraft,
  onToggleCityEditing,
  onOpenCityInput,
  onAddCity,
  onSubmitCity,
  onRemoveCity,
}: VisitCitiesRowProps) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name="location-outline" size={18} color={colors.accentTealDark} />
      <Text selectable style={styles.infoLabel}>
        訪問都市
      </Text>
      <View style={styles.cityValueArea}>
        {cities.length === 0 && !isCityEditing ? (
          <Text selectable style={styles.cityEmptyInline}>
            未登録
          </Text>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            style={styles.cityChipScroll}
            contentContainerStyle={styles.cityChipRow}
          >
            {cities.map((city) =>
              isCityEditing ? (
                <View key={city.id} style={styles.chipWithDelete}>
                  <Text selectable style={styles.chipText} numberOfLines={1}>
                    {city.name}
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`${city.name} を削除`}
                    style={styles.chipDelete}
                    hitSlop={6}
                    onPress={() => onRemoveCity(city)}
                  >
                    <Ionicons name="close" size={12} color={colors.textPrimary} />
                  </Pressable>
                </View>
              ) : (
                <View key={city.id} style={styles.chip}>
                  <Text selectable style={styles.chipText} numberOfLines={1}>
                    {city.name}
                  </Text>
                </View>
              ),
            )}
            {isCityEditing ? (
              isCityInputOpen ? (
                <View style={styles.cityInputRow}>
                  <TextInput
                    value={cityDraft}
                    onChangeText={onChangeCityDraft}
                    autoFocus
                    placeholder="例: バンコク"
                    placeholderTextColor={colors.textMuted}
                    style={styles.cityInput}
                    returnKeyType="done"
                    onSubmitEditing={onSubmitCity}
                  />
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="都市を追加"
                    style={styles.cityCommit}
                    onPress={onAddCity}
                  >
                    <Ionicons name="checkmark" size={16} color={colors.white} />
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="都市を追加"
                  style={styles.addCityPill}
                  onPress={onOpenCityInput}
                >
                  <Ionicons name="add" size={14} color={colors.accentTealDark} />
                  <Text selectable style={styles.addCityText}>
                    都市を追加
                  </Text>
                </Pressable>
              )
            ) : null}
          </ScrollView>
        )}
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={isCityEditing ? '訪問都市の編集を終える' : '訪問都市を編集'}
        hitSlop={6}
        style={styles.editIconButton}
        onPress={onToggleCityEditing}
      >
        <Ionicons
          name={isCityEditing ? 'checkmark' : 'pencil-outline'}
          size={16}
          color={isCityEditing ? colors.accentTealDark : colors.textMuted}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  infoLabel: {
    width: 72,
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '800',
  },
  editIconButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderColor: colors.border,
    borderWidth: 1,
  },
  cityValueArea: {
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
  },
  cityEmptyInline: {
    color: colors.textMuted,
    fontSize: 13,
    fontStyle: 'italic',
  },
  cityChipScroll: {
    flexGrow: 0,
  },
  cityChipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingRight: spacing.xs,
  },
  chip: {
    minHeight: 26,
    justifyContent: 'center',
    paddingHorizontal: 10,
    borderRadius: radius.round,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.paper,
  },
  chipWithDelete: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 28,
    paddingLeft: 10,
    paddingRight: 4,
    borderRadius: radius.round,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.paper,
  },
  chipText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  chipDelete: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: 'rgba(84, 55, 21, 0.10)',
  },
  addCityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 28,
    paddingHorizontal: 10,
    borderRadius: radius.round,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.accentTealDark,
    backgroundColor: 'rgba(47, 155, 145, 0.08)',
  },
  addCityText: {
    color: colors.accentTealDark,
    fontSize: 12,
    fontWeight: '800',
  },
  cityInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  cityInput: {
    minWidth: 100,
    minHeight: 30,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.round,
    borderWidth: 1,
    borderColor: colors.accentTealDark,
    backgroundColor: colors.white,
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  cityCommit: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: colors.accentTealDark,
  },
});
