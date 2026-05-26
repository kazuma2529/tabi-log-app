import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useDerivedValue,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CtaButton } from '@/features/onboarding/cta-button';
import { PageDots } from '@/features/onboarding/page-dots';
import { ONBOARDING_IMAGES, ONBOARDING_LAST_INDEX } from '@/features/onboarding/slides';
import { markOnboardingCompleted } from '@/lib/onboarding-storage';
import { colors, radius } from '@/theme';

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: pageWidth, height: pageHeight } = useWindowDimensions();

  const scrollX = useSharedValue(0);
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const [pageIndex, setPageIndex] = useState(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  useDerivedValue(() => {
    const safeWidth = pageWidth > 0 ? pageWidth : 1;
    const next = Math.round(scrollX.value / safeWidth);
    runOnJS(setPageIndex)(next);
  }, [pageWidth]);

  const handleComplete = useCallback(async () => {
    await markOnboardingCompleted();
    router.replace('/(tabs)');
  }, [router]);

  const handleCtaPress = useCallback(() => {
    if (pageIndex >= ONBOARDING_LAST_INDEX) {
      void handleComplete();
      return;
    }
    const nextIndex = Math.min(pageIndex + 1, ONBOARDING_LAST_INDEX);
    scrollRef.current?.scrollTo({ x: nextIndex * pageWidth, animated: true });
  }, [handleComplete, pageIndex, pageWidth, scrollRef]);

  // momentum 終了時に index を確定させ、setState の更新タイミングと scroll の停止位置をぴったり揃える。
  const handleMomentumEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (pageWidth <= 0) return;
      const next = Math.round(event.nativeEvent.contentOffset.x / pageWidth);
      setPageIndex(next);
    },
    [pageWidth],
  );

  return (
    <View style={styles.root}>
      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        onMomentumScrollEnd={handleMomentumEnd}
        scrollEventThrottle={16}
        bounces={false}
        decelerationRate="fast"
      >
        {ONBOARDING_IMAGES.map((source, index) => (
          <View key={index} style={{ width: pageWidth, height: pageHeight }}>
            <Image source={source} style={styles.slideImage} resizeMode="cover" />
          </View>
        ))}
      </Animated.ScrollView>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="オンボーディングをスキップ"
        onPress={handleComplete}
        style={[styles.skip, { top: insets.top + 8 }]}
        hitSlop={12}
      >
        <Text style={styles.skipLabel}>スキップ</Text>
      </Pressable>

      <View style={[styles.bottomBar, { bottom: insets.bottom + 24 }]} pointerEvents="box-none">
        <PageDots scrollX={scrollX} pageWidth={pageWidth} />
        <CtaButton scrollX={scrollX} pageWidth={pageWidth} onPress={handleCtaPress} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  slideImage: {
    width: '100%',
    height: '100%',
  },
  skip: {
    position: 'absolute',
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  skipLabel: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: '700',
  },
  bottomBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.round,
    backgroundColor: 'rgba(255, 248, 234, 0.55)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
});
