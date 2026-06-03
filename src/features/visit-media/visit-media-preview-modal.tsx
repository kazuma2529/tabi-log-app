import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/theme';
import type { VisitMedia } from '@/types';

type VisitMediaPreviewModalProps = {
  visible: boolean;
  media: VisitMedia[];
  initialIndex: number;
  onClose: () => void;
};

function PreviewVideo({ uri }: { uri: string }) {
  const player = useVideoPlayer(uri, (instance) => {
    instance.loop = false;
    instance.play();
  });

  return (
    <VideoView
      player={player}
      style={styles.previewMedia}
      contentFit="contain"
      nativeControls
    />
  );
}

function PreviewSlide({ item }: { item: VisitMedia }) {
  if (item.mediaType === 'video') {
    return <PreviewVideo uri={item.uri} />;
  }

  return <Image source={{ uri: item.uri }} style={styles.previewMedia} contentFit="contain" />;
}

export function VisitMediaPreviewModal({
  visible,
  media,
  initialIndex,
  onClose,
}: VisitMediaPreviewModalProps) {
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<VisitMedia>>(null);
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const width = Dimensions.get('window').width;
  const translateY = useSharedValue(0);
  const backdropAlpha = useSharedValue(1);
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropAlpha.value,
  }));
  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  useEffect(() => {
    if (!visible) return;
    setActiveIndex(initialIndex);
    translateY.value = 0;
    backdropAlpha.value = 1;
    requestAnimationFrame(() => {
      listRef.current?.scrollToIndex({ index: initialIndex, animated: false });
    });
  }, [initialIndex, visible, translateY, backdropAlpha]);

  const onMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setActiveIndex(index);
  };

  const swipeToClose = Gesture.Pan()
    .failOffsetX([-18, 18]) // 横スワイプ（ページング）を優先
    .activeOffsetY([18, 9999])
    .onUpdate((event) => {
      const next = Math.max(event.translationY, 0);
      translateY.value = next;
      backdropAlpha.value = Math.max(1 - next / 320, 0.3);
    })
    .onEnd((event) => {
      const shouldClose = event.translationY > 140 || event.velocityY > 900;
      if (shouldClose) {
        runOnJS(onClose)();
        return;
      }
      translateY.value = withTiming(0, { duration: 180 });
      backdropAlpha.value = withTiming(1, { duration: 180 });
    });

  if (!visible || media.length === 0) {
    return null;
  }

  return (
    <Modal visible={visible} animationType="fade" onRequestClose={onClose}>
      <GestureDetector gesture={swipeToClose}>
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <Animated.View style={[styles.content, contentStyle]}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="プレビューを閉じる"
              style={[styles.closeButton, { top: insets.top + 8 }]}
              onPress={onClose}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </Pressable>
            <FlatList
              ref={listRef}
              horizontal
              pagingEnabled
              data={media}
              keyExtractor={(item) => item.id}
              initialScrollIndex={initialIndex}
              getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
              onMomentumScrollEnd={onMomentumScrollEnd}
              renderItem={({ item }) => (
                <View style={[styles.slide, { width }]}>
                  <PreviewSlide item={item} />
                </View>
              )}
              showsHorizontalScrollIndicator={false}
            />
            <View style={[styles.pager, { bottom: insets.bottom + 16 }]}>
              {media.map((item, index) => (
                <View
                  key={item.id}
                  style={[styles.dot, index === activeIndex ? styles.dotActive : null]}
                />
              ))}
            </View>
          </Animated.View>
        </Animated.View>
      </GestureDetector>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: '#050505',
  },
  content: {
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    zIndex: 2,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  previewMedia: {
    width: '100%',
    height: '78%',
  },
  pager: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.28)',
  },
  dotActive: {
    backgroundColor: colors.accentTeal,
    width: 18,
  },
});
