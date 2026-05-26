import { StyleSheet, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  interpolateColor,
  type SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';

import { colors } from '@/theme';

import { ONBOARDING_IMAGES } from './slides';

type PageDotsProps = {
  scrollX: SharedValue<number>;
  pageWidth: number;
};

export function PageDots({ scrollX, pageWidth }: PageDotsProps) {
  return (
    <View style={styles.row}>
      {ONBOARDING_IMAGES.map((_, index) => (
        <Dot key={index} index={index} scrollX={scrollX} pageWidth={pageWidth} />
      ))}
    </View>
  );
}

type DotProps = {
  index: number;
  scrollX: SharedValue<number>;
  pageWidth: number;
};

const DOT_BASE_SIZE = 8;
const DOT_ACTIVE_SIZE = 10;

function Dot({ index, scrollX, pageWidth }: DotProps) {
  const animatedStyle = useAnimatedStyle(() => {
    const safeWidth = pageWidth > 0 ? pageWidth : 1;
    const inputRange = [(index - 1) * safeWidth, index * safeWidth, (index + 1) * safeWidth];

    const size = interpolate(
      scrollX.value,
      inputRange,
      [DOT_BASE_SIZE, DOT_ACTIVE_SIZE, DOT_BASE_SIZE],
      Extrapolation.CLAMP,
    );
    const backgroundColor = interpolateColor(scrollX.value, inputRange, [
      colors.textMuted,
      colors.accentTealDark,
      colors.textMuted,
    ]);

    return { width: size, height: size, backgroundColor };
  });

  return <Animated.View style={[styles.dot, animatedStyle]} />;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    borderRadius: DOT_ACTIVE_SIZE / 2,
  },
});
