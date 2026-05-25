import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { UndoToastProvider } from '@/components';
import { TravelProvider } from '@/features';
import { colors } from '@/theme';

import 'react-native-reanimated';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <TravelProvider>
          <UndoToastProvider>
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.background },
              }}
            >
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="add/index" options={{ presentation: 'modal' }} />
              <Stack.Screen name="bucket-list/index" />
              <Stack.Screen name="bucket-list/add" options={{ presentation: 'modal' }} />
              <Stack.Screen name="bucket/[countryId]/index" />
              <Stack.Screen name="country/[countryId]/index" />
              <Stack.Screen name="visited-countries/index" />
            </Stack>
            <StatusBar style="dark" />
          </UndoToastProvider>
        </TravelProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
