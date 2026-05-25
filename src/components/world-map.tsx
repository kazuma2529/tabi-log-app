import { Ionicons } from '@expo/vector-icons';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import Svg, { Circle, G, Path } from 'react-native-svg';

import { WORLD_COUNTRY_PATH_BY_ISO, WORLD_COUNTRY_PATHS } from '@/data/world-country-paths';
import { getMapCountries } from '@/features';
import { colors, radius, shadows, spacing } from '@/theme';
import type { Country } from '@/types';

import { useWorldMapZoom } from './world-map/use-world-map-zoom';

type WorldMapProps = {
  visitedCountryIds: Set<string>;
  bucketCountryIds: Set<string>;
  onOpenCountry: (country: Country) => void;
  onAddVisit: (country: Country) => void;
  onAddBucket: (country: Country) => void;
};

const MAP_HEIGHT = 252;

export function WorldMap({ visitedCountryIds, bucketCountryIds, onOpenCountry, onAddVisit, onAddBucket }: WorldMapProps) {
  const countries = getMapCountries();
  const countriesByIso = new Map(countries.map((country) => [country.isoCode, country]));
  const tappableCountries = countries.filter((country) => WORLD_COUNTRY_PATH_BY_ISO[country.isoCode]);
  const backgroundCountries = WORLD_COUNTRY_PATHS.filter(
    (country) => country.isoCode !== 'AQ' && !countriesByIso.has(country.isoCode),
  );

  const { isZoomed, composedGesture, animatedStyle, onLayout, handleResetZoom } = useWorldMapZoom();

  function handleCountryPress(country: Country) {
    const visited = visitedCountryIds.has(country.id);
    const listed = bucketCountryIds.has(country.id);

    if (visited) {
      Alert.alert(`${country.flag} ${country.nameJa}`, 'この国の訪問記録を開きます。', [
        { text: '閉じる', style: 'cancel' },
        { text: '国詳細を見る', onPress: () => onOpenCountry(country) },
      ]);
      return;
    }

    Alert.alert(`${country.flag} ${country.nameJa}`, '未訪問の国です。', [
      { text: '閉じる', style: 'cancel' },
      { text: '訪問記録を追加', onPress: () => onAddVisit(country) },
      listed ? { text: '追加済み', style: 'cancel' } : { text: '行きたい国に追加', onPress: () => onAddBucket(country) },
    ]);
  }

  return (
    <View style={styles.wrap}>
      <View pointerEvents="none" style={styles.decorLayer}>
        <Svg width="100%" height="100%" viewBox="0 0 360 324" preserveAspectRatio="none">
          <Path d="M5 32 C25 20 39 21 56 32" stroke="#84B9C7" strokeWidth={2} fill="none" opacity={0.55} />
          <Path d="M13 42 C34 29 51 35 66 45" stroke="#84B9C7" strokeWidth={1.5} fill="none" opacity={0.4} />
          <Path d="M291 34 C307 16 327 18 345 31" stroke="#84B9C7" strokeWidth={2} fill="none" strokeDasharray="4 6" opacity={0.46} />
          <Path d="M308 27 L334 13 L323 33 L317 28 L308 27 Z" fill="#6DAFC2" opacity={0.62} />
          <Path d="M38 258 L50 228 L64 258 Z" fill="#F2DDA8" opacity={0.85} />
          <Path d="M50 228 L50 258" stroke="#74AFC2" strokeWidth={1.6} />
          <Path d="M28 259 C47 266 62 264 78 258" stroke="#74AFC2" strokeWidth={2} fill="none" opacity={0.55} />
          <Path d="M236 275 C256 281 278 281 303 274" stroke="#83BCC7" strokeWidth={2.5} fill="none" opacity={0.55} />
          <Path d="M244 289 C264 294 287 294 313 286" stroke="#83BCC7" strokeWidth={2} fill="none" opacity={0.36} />
          <Circle cx="47" cy="34" r="20" stroke="#D48558" strokeWidth={2} fill="none" opacity={0.4} />
          <Path d="M31 35 L63 35 M37 45 L57 45" stroke="#D48558" strokeWidth={2} opacity={0.38} />
        </Svg>
      </View>

      <GestureDetector gesture={composedGesture}>
        <Animated.View style={styles.zoomViewport} onLayout={onLayout}>
          <Animated.View style={[styles.zoomInner, animatedStyle]}>
            <Svg width="100%" height="100%" viewBox="0 0 360 198">
              <G opacity={0.96}>
                {backgroundCountries.map((country) => (
                  <Path
                    key={country.isoCode}
                    d={country.path}
                    fill="#D0CFC8"
                    fillRule="evenodd"
                    stroke="rgba(255, 248, 232, 0.88)"
                    strokeWidth={0.45}
                  />
                ))}
              </G>
              {tappableCountries.map((country) => {
                const visited = visitedCountryIds.has(country.id);
                const listed = bucketCountryIds.has(country.id);
                const mapCountry = WORLD_COUNTRY_PATH_BY_ISO[country.isoCode];
                const fill = visited ? colors.visited : listed ? colors.accentGoldLight : colors.unvisited;
                const stroke = visited ? colors.accentTealDark : listed ? colors.accentGold : 'rgba(255, 248, 232, 0.9)';

                return (
                  <Path
                    key={country.id}
                    d={mapCountry?.path}
                    fill={fill}
                    fillRule="evenodd"
                    stroke={stroke}
                    strokeWidth={visited || listed ? 0.8 : 0.5}
                    onPress={() => handleCountryPress(country)}
                  />
                );
              })}
              {tappableCountries.map((country) => (
                <Circle
                  key={`${country.id}-tap`}
                  cx={(country.mapX / 100) * 360}
                  cy={(country.mapY / 100) * 198}
                  r={8}
                  fill="transparent"
                  onPress={() => handleCountryPress(country)}
                />
              ))}
            </Svg>
          </Animated.View>
        </Animated.View>
      </GestureDetector>

      {isZoomed ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="ズームをリセット"
          style={({ pressed }) => [styles.resetButton, pressed && styles.pressed]}
          onPress={handleResetZoom}
        >
          <Ionicons name="refresh" size={20} color={colors.textPrimary} />
        </Pressable>
      ) : null}

      <View style={styles.mapControls}>
        <View style={styles.legend}>
          <LegendSwatch color={colors.visited} label="訪問済み" />
          <LegendSwatch color={colors.unvisited} label="未訪問" />
          <LegendSwatch color={colors.accentGoldLight} label="行きたい国" />
        </View>
      </View>
    </View>
  );
}

function LegendSwatch({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.swatch, { backgroundColor: color }]} />
      <Text selectable style={styles.legendText}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
    overflow: 'hidden',
    minHeight: 330,
    borderRadius: radius.xl,
    backgroundColor: 'rgba(255, 247, 229, 0.34)',
    paddingTop: spacing.xxl,
    paddingRight: 2,
    paddingBottom: spacing.sm,
    paddingLeft: 2,
  },
  decorLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  zoomViewport: {
    width: '100%',
    height: MAP_HEIGHT,
    marginTop: spacing.xl,
    overflow: 'hidden',
  },
  zoomInner: {
    width: '100%',
    height: '100%',
    transformOrigin: 'top left',
  },
  mapControls: {
    marginTop: -2,
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.round,
    backgroundColor: 'rgba(255, 248, 232, 0.78)',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  swatch: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(65, 43, 18, 0.12)',
  },
  legendText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  resetButton: {
    position: 'absolute',
    top: spacing.xxl + spacing.sm,
    right: spacing.md,
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.round,
    borderColor: 'rgba(166, 108, 32, 0.32)',
    borderWidth: 1,
    backgroundColor: 'rgba(255, 249, 238, 0.94)',
    boxShadow: shadows.soft,
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }],
  },
});
