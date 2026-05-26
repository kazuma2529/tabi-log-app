import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { UndoToastProvider } from '@/components';
import { TravelProvider } from '@/features';
import { useTravel } from '@/hooks/use-travel';
import { isOnboardingCompleted, markOnboardingCompleted } from '@/lib/onboarding-storage';
import { colors } from '@/theme';

import 'react-native-reanimated';

SplashScreen.preventAutoHideAsync().catch(() => {
  // 既に hide 済みでも問題ないので無視する。
});

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <TravelProvider>
          <UndoToastProvider>
            <OnboardingGate />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.background },
              }}
            >
              <Stack.Screen name="(tabs)" />
              <Stack.Screen
                name="onboarding"
                options={{ gestureEnabled: false, animation: 'fade' }}
              />
              <Stack.Screen name="add/index" options={{ presentation: 'modal' }} />
              <Stack.Screen name="bucket-list/index" />
              <Stack.Screen name="bucket-list/add" options={{ presentation: 'modal' }} />
              <Stack.Screen name="bucket/[countryId]/index" />
              <Stack.Screen name="country/[countryId]/index" />
              <Stack.Screen name="visited-countries/index" />
              <Stack.Screen name="yearly-analysis/index" />
            </Stack>
            <StatusBar style="dark" />
          </UndoToastProvider>
        </TravelProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function OnboardingGate() {
  const { isReady, data } = useTravel();
  const router = useRouter();
  const decidedRef = useRef(false);

  useEffect(() => {
    if (!isReady || decidedRef.current) return;
    decidedRef.current = true;

    (async () => {
      try {
        const completed = await isOnboardingCompleted();
        const hasVisits = data.visits.length > 0;

        if (!completed) {
          if (hasVisits) {
            // 既存ユーザーには出さず、completed として保存しておく。
            await markOnboardingCompleted();
          } else {
            router.replace('/onboarding');
          }
        }
      } finally {
        await SplashScreen.hideAsync().catch(() => {
          // 既に hide 済みのケースは無視する。
        });
      }
    })();
  }, [isReady, data.visits.length, router]);

  return null;
}
