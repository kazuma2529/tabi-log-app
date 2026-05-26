import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  interpolateColor,
  type SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';

import { colors, radius, shadows } from '@/theme';

import { ONBOARDING_LAST_INDEX } from './slides';

type CtaButtonProps = {
  scrollX: SharedValue<number>;
  pageWidth: number;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function CtaButton({ scrollX, pageWidth, onPress, style }: CtaButtonProps) {
  const transitionStart = (ONBOARDING_LAST_INDEX - 0.5) * pageWidth;
  const transitionEnd = ONBOARDING_LAST_INDEX * pageWidth;

  const containerStyle = useAnimatedStyle(() => {
    const safeWidth = pageWidth > 0 ? pageWidth : 1;
    const start = (ONBOARDING_LAST_INDEX - 0.5) * safeWidth;
    const end = ONBOARDING_LAST_INDEX * safeWidth;
    const backgroundColor = interpolateColor(
      scrollX.value,
      [start, end],
      [colors.accentGold, colors.accentTeal],
    );

    return { backgroundColor };
  });

  const nextLabelStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollX.value,
      [transitionStart, transitionEnd],
      [1, 0],
      Extrapolation.CLAMP,
    );
    return { opacity };
  });

  const startLabelStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollX.value,
      [transitionStart, transitionEnd],
      [0, 1],
      Extrapolation.CLAMP,
    );
    return { opacity };
  });

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel="次のスライドへ、または、はじめる"
      onPress={onPress}
      style={[styles.button, containerStyle, style]}
    >
      <Animated.Text style={[styles.label, nextLabelStyle]}>次へ</Animated.Text>
      <Animated.Text style={[styles.label, styles.labelOverlay, startLabelStyle]}>
        はじめる
      </Animated.Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    minWidth: 124,
    paddingHorizontal: 28,
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: shadows.button,
  },
  label: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '800',
  },
  labelOverlay: {
    position: 'absolute',
  },
});
