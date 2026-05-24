import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';

export default function IndexScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>世界旅記録</Text>
      <Text style={styles.subtitle}>Phase 1: プロジェクトの土台が整いました</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
