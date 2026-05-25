import type { ReactNode } from 'react';
import { ImageBackground, ScrollView, StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, G, Line, Path, Rect } from 'react-native-svg';

import { colors, spacing } from '@/theme';

type AppScreenProps = {
  title?: string;
  subtitle?: string;
  left?: ReactNode;
  right?: ReactNode;
  children: ReactNode;
  sky?: boolean;
  backgroundImage?: ImageSourcePropType;
  variant?: 'paper' | 'sky' | 'diary';
  headerAlign?: 'left' | 'center';
};

export function AppScreen({
  title,
  subtitle,
  left,
  right,
  children,
  sky = false,
  backgroundImage,
  variant,
  headerAlign = 'left',
}: AppScreenProps) {
  const insets = useSafeAreaInsets();
  const screenVariant = variant ?? (sky ? 'sky' : 'paper');
  const isSky = screenVariant === 'sky';
  const isDiary = screenVariant === 'diary';

  return (
    <View style={[styles.root, isSky && styles.skyRoot, isDiary && styles.diaryRoot]}>
      <TravelBackdrop variant={screenVariant} backgroundImage={backgroundImage} />
      <ScrollView
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          isDiary && styles.diaryContent,
          {
            paddingTop: isSky ? Math.max(insets.top - 8, 36) : Math.max(insets.top, 22) + (isDiary ? 18 : 4),
            paddingBottom: Math.max(insets.bottom, 22) + 104,
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
    </View>
  );
}

function TravelBackdrop({ variant, backgroundImage }: { variant: 'paper' | 'sky' | 'diary'; backgroundImage?: ImageSourcePropType }) {
  if (backgroundImage) {
    return (
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <ImageBackground source={backgroundImage} resizeMode="cover" style={StyleSheet.absoluteFill}>
          <View style={styles.imageWash} />
        </ImageBackground>
      </View>
    );
  }

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {variant === 'sky' ? (
        <ImageBackground source={require('../../assets/images/home-travel-background.png')} resizeMode="cover" style={StyleSheet.absoluteFill}>
          <View style={styles.skyWash} />
        </ImageBackground>
      ) : null}
      {variant === 'paper' ? (
        <Svg width="100%" height="100%" viewBox="0 0 390 844" preserveAspectRatio="none" style={StyleSheet.absoluteFill}>
          <Circle cx="48" cy="116" r="46" fill="#F4D48D" opacity="0.18" />
          <Circle cx="336" cy="140" r="66" fill="#7BC8C2" opacity="0.12" />
          <Circle cx="314" cy="722" r="74" fill="#E5B254" opacity="0.16" />
          <Path d="M18 665 C88 630 124 704 194 664 S320 640 382 694" stroke="#C59C59" strokeWidth="2" fill="none" opacity="0.20" />
          <Path d="M7 206 C68 182 105 225 150 190 S247 165 374 215" stroke="#65AFC0" strokeWidth="2" fill="none" opacity="0.16" />
          <Path d="M334 44 l20 12 l-18 10 l-10 20 l-11 -20 l-18 -10 l20 -12 l9 -20 z" fill="#D7A546" opacity="0.18" />
        </Svg>
      ) : null}
      {variant === 'diary' ? <DiaryBackdrop /> : null}
    </View>
  );
}

function DiaryBackdrop() {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 390 844" preserveAspectRatio="none" style={StyleSheet.absoluteFill}>
      <Rect width="390" height="844" fill="#FBF2E2" />
      <Circle cx="24" cy="74" r="2" fill="#D8A75C" opacity="0.35" />
      <Circle cx="280" cy="65" r="1.5" fill="#61AFC0" opacity="0.35" />
      <Circle cx="364" cy="342" r="2.2" fill="#D8A75C" opacity="0.24" />
      <Path d="M17 92 C64 76 118 83 160 105 S253 133 345 91" stroke="#E7D5B5" strokeWidth="1" fill="none" opacity="0.25" />
      <Path d="M44 628 C102 606 137 665 198 635 S304 605 374 655" stroke="#D8B477" strokeWidth="2" fill="none" opacity="0.22" />
      <Path d="M330 52 C338 43 350 43 358 52 C365 60 366 72 356 81" stroke="#75B7C5" strokeWidth="1.5" fill="none" strokeDasharray="5 5" opacity="0.55" />
      <Path d="M358 81 l12 -5 l-5 13 z" fill="#75B7C5" opacity="0.55" />
      <G opacity="0.82" transform="rotate(-9 57 58)">
        <Rect x="41" y="34" width="27" height="36" rx="3" fill="#F5E4C2" stroke="#BE8E4D" strokeWidth="1.4" />
        <Path d="M47 42 h15 M47 49 h15 M47 56 h11" stroke="#A77943" strokeWidth="1.2" strokeLinecap="round" opacity="0.65" />
        <Path d="M63 30 h8 v11 h-8 z" fill="#E7B55E" stroke="#A66C20" strokeWidth="1" />
        <Path d="M68 66 l12 -13 l4 4 l-12 13 l-6 2 z" fill="#7FB8C7" stroke="#5B98A7" strokeWidth="1" />
      </G>
      <G opacity="0.22" transform="rotate(-8 77 24)">
        <Path d="M49 18 C62 7 92 7 106 18" stroke="#D19A45" strokeWidth="1.2" fill="none" strokeDasharray="3 4" />
        <Circle cx="51" cy="19" r="1.2" fill="#D19A45" />
      </G>
      <G opacity="0.2" transform="rotate(11 353 119)">
        <Rect x="325" y="94" width="58" height="34" rx="16" fill="none" stroke="#C46C45" strokeWidth="2" strokeDasharray="4 4" />
        <Line x1="333" y1="111" x2="374" y2="103" stroke="#C46C45" strokeWidth="1" />
        <Line x1="335" y1="120" x2="376" y2="112" stroke="#C46C45" strokeWidth="1" />
      </G>
      <Path d="M0 702 C39 690 67 710 104 697 C149 682 184 702 223 690 C269 675 306 690 390 676 L390 844 L0 844 Z" fill="#F3DDB4" opacity="0.38" />
      <Path d="M0 703 C38 691 68 710 104 697 C149 682 184 702 223 690 C270 675 306 690 390 676" stroke="#C98D3A" strokeWidth="1.2" fill="none" opacity="0.25" />
      <Path d="M20 730 C54 716 81 751 119 733 S190 717 230 737 S314 757 369 721" stroke="#6DB9C5" strokeWidth="2" fill="none" opacity="0.28" />
      <G opacity="0.52">
        <Path d="M292 726 C300 705 318 696 338 704 C355 711 362 729 356 751 C336 757 311 748 292 726 Z" fill="#7FC4C5" />
        <Path d="M316 724 c-8 -12 -7 -24 3 -35 M324 724 c4 -15 14 -25 29 -29 M328 730 c13 -6 27 -6 42 0" stroke="#8A6A3F" strokeWidth="2" fill="none" strokeLinecap="round" />
        <Rect x="300" y="725" width="48" height="20" rx="10" fill="#E6BD67" />
      </G>
      <Circle cx="58" cy="752" r="2" fill="#C98D3A" opacity="0.38" />
      <Circle cx="264" cy="734" r="2" fill="#C98D3A" opacity="0.34" />
      <Path d="M274 756 l6 3 l-6 3 l-3 6 l-3 -6 l-6 -3 l6 -3 l3 -6 z" fill="#D8A75C" opacity="0.45" />
    </Svg>
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
  skyWash: {
    flex: 1,
    backgroundColor: 'rgba(255, 246, 226, 0.08)',
  },
  imageWash: {
    flex: 1,
    backgroundColor: 'rgba(255, 248, 234, 0.14)',
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
