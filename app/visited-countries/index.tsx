import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { AppScreen, VisitedCountriesList } from '@/components';
import { colors } from '@/theme';

export default function VisitedCountriesScreen() {
  const router = useRouter();

  return (
    <AppScreen
      title="旅した国"
      headerAlign="center"
      left={
        <Pressable accessibilityRole="button" accessibilityLabel="戻る" style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </Pressable>
      }
    >
      <VisitedCountriesList />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  backButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 21,
    backgroundColor: colors.paper,
    borderColor: colors.border,
    borderWidth: 1,
  },
});
