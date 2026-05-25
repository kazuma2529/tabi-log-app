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
      right={
        <Pressable accessibilityRole="button" accessibilityLabel="戻る" style={styles.closeButton} onPress={() => router.back()}>
          <Ionicons name="close" size={22} color={colors.textPrimary} />
        </Pressable>
      }
    >
      <VisitedCountriesList />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  closeButton: {
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
