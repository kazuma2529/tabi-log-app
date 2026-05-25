import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { IconButton } from '@/components';

export function TopBar({ onMore }: { onMore?: () => void }) {
  const router = useRouter();

  return (
    <View style={styles.topBar}>
      <IconButton icon="chevron-back" accessibilityLabel="戻る" onPress={() => router.back()} />
      <View style={styles.filler} />
      {onMore ? (
        <IconButton icon="ellipsis-horizontal" iconSize={22} accessibilityLabel="その他の操作" onPress={onMore} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 42,
  },
  filler: {
    flex: 1,
  },
});
