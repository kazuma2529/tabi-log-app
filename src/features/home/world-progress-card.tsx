import { ImageBackground, StyleSheet, Text, View } from 'react-native';

import { ProgressBar } from '@/components';
import { getWorldProgress } from '@/features';
import { colors } from '@/theme';

type WorldProgress = ReturnType<typeof getWorldProgress>;

type WorldProgressCardProps = {
  progress: WorldProgress;
};

export function WorldProgressCard({ progress }: WorldProgressCardProps) {
  return (
    <View style={styles.progressCard}>
      <ImageBackground
        source={require('../../../assets/images/progress-treasure-map.png')}
        resizeMode="stretch"
        style={styles.progressMap}
      />
      <View style={styles.progressHeader}>
        <View style={styles.progressTextBlock}>
          <Text selectable style={styles.cardLabel}>
            世界制覇の進捗
          </Text>
          <Text selectable style={styles.bigNumber}>
            {progress.visited}
            <Text style={styles.totalText}> / {progress.total} か国</Text>
          </Text>
          <Text selectable style={styles.rateText}>
            世界制覇率 {progress.percentage}%
          </Text>
        </View>
      </View>
      <View style={styles.progressBarWrap}>
        <ProgressBar value={progress.percentage} color="#2D9A85" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  progressCard: {
    position: 'relative',
    minHeight: 158,
    gap: 10,
    marginTop: 2,
    marginHorizontal: -2,
    paddingTop: 32,
    paddingRight: 112,
    paddingBottom: 26,
    paddingLeft: 32,
    backgroundColor: 'transparent',
  },
  progressMap: {
    position: 'absolute',
    inset: 0,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressTextBlock: {
    flex: 1,
    gap: 6,
  },
  cardLabel: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  bigNumber: {
    color: colors.textPrimary,
    fontSize: 48,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  totalText: {
    fontSize: 18,
    fontWeight: '800',
  },
  rateText: {
    color: colors.accentTeal,
    fontSize: 18,
    fontWeight: '900',
  },
  progressBarWrap: {
    maxWidth: 214,
    marginTop: 4,
  },
});
