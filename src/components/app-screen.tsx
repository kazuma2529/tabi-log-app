import type { ReactNode, RefObject } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ImageSourcePropType,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing } from '@/theme';

import { TravelBackdrop } from './travel-backdrop';

type AppScreenProps = {
  title?: string;
  subtitle?: string;
  left?: ReactNode;
  right?: ReactNode;
  children: ReactNode;
  footerOverlay?: ReactNode;
  sky?: boolean;
  backgroundImage?: ImageSourcePropType;
  backgroundImageWashOpacity?: number;
  variant?: 'paper' | 'sky' | 'diary';
  headerAlign?: 'left' | 'center';
  scrollViewRef?: RefObject<ScrollView | null>;
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  scrollEventThrottle?: number;
};

export function AppScreen({
  title,
  subtitle,
  left,
  right,
  children,
  footerOverlay,
  sky = false,
  backgroundImage,
  backgroundImageWashOpacity,
  variant,
  headerAlign = 'left',
  scrollViewRef,
  onScroll,
  scrollEventThrottle = 16,
}: AppScreenProps) {
  const insets = useSafeAreaInsets();
  const screenVariant = variant ?? (sky ? 'sky' : 'paper');
  const isSky = screenVariant === 'sky';
  const isDiary = screenVariant === 'diary';

  return (
    <View style={[styles.root, isSky && styles.skyRoot, isDiary && styles.diaryRoot]}>
      <TravelBackdrop
        variant={screenVariant}
        backgroundImage={backgroundImage}
        backgroundImageWashOpacity={backgroundImageWashOpacity}
      />
      <ScrollView
        ref={scrollViewRef}
        contentInsetAdjustmentBehavior="never"
        automaticallyAdjustKeyboardInsets
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        showsVerticalScrollIndicator={false}
        alwaysBounceVertical={false}
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        contentContainerStyle={[
          styles.content,
          isDiary && styles.diaryContent,
          {
            paddingTop: isSky ? Math.max(insets.top - 8, 36) : Math.max(insets.top, 22) + (isDiary ? 18 : 4),
            paddingBottom: Math.max(insets.bottom, 22) + 92,
          },
        ]}
      >
        {title ? (
          headerAlign === 'center' && (left || right) ? (
            <View style={styles.header}>
              <View style={styles.sideSlot}>{left}</View>
              <View style={styles.centerTitleSlot}>
                <Text selectable style={styles.title}>
                  {title}
                </Text>
                {subtitle ? (
                  <Text selectable style={styles.subtitle}>
                    {subtitle}
                  </Text>
                ) : null}
              </View>
              <View style={styles.sideSlot}>{right}</View>
            </View>
          ) : (
            <View style={[styles.header, headerAlign === 'center' && styles.centerHeader]}>
              {left}
              <View style={[styles.headerText, headerAlign === 'center' && styles.centerHeaderText]}>
                <Text selectable style={styles.title}>
                  {title}
                </Text>
                {subtitle ? (
                  <Text selectable style={styles.subtitle}>
                    {subtitle}
                  </Text>
                ) : null}
              </View>
              {right}
            </View>
          )
        ) : null}
        {children}
      </ScrollView>
      {footerOverlay ? (
        <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
          {footerOverlay}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  skyRoot: {
    backgroundColor: colors.backgroundSky,
  },
  diaryRoot: {
    backgroundColor: '#FBF2E2',
  },
  content: {
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
  diaryContent: {
    gap: spacing.xl,
  },
  header: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  centerHeader: {
    justifyContent: 'center',
  },
  centerHeaderText: {
    alignItems: 'center',
    flex: 0,
  },
  sideSlot: {
    minWidth: 42,
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerTitleSlot: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
});
