import { Ionicons } from '@expo/vector-icons';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radius, shadows, spacing } from '@/theme';

type UndoToastConfig = {
  label: string;
  onUndo: () => void | Promise<void>;
  onExpire?: () => void | Promise<void>;
  duration?: number;
};

type ToastInternal = UndoToastConfig & {
  id: number;
};

type UndoToastContextValue = {
  showUndoToast: (config: UndoToastConfig) => void;
  dismiss: () => void;
};

const UndoToastContext = createContext<UndoToastContextValue | null>(null);

const DEFAULT_DURATION = 4000;

export function UndoToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastInternal | null>(null);
  const idRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const slide = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const animateOut = useCallback(
    (after: () => void) => {
      Animated.parallel([
        Animated.timing(slide, {
          toValue: 0,
          duration: 180,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start(after);
    },
    [slide, opacity],
  );

  const animateIn = useCallback(() => {
    slide.setValue(0);
    opacity.setValue(0);
    Animated.parallel([
      Animated.timing(slide, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  }, [slide, opacity]);

  const showUndoToast = useCallback(
    (config: UndoToastConfig) => {
      clearTimer();

      // 直前のトーストが残っていれば、まず expire（ファイル削除等）を確定する。
      setToast((prev) => {
        if (prev) {
          void prev.onExpire?.();
        }
        const next: ToastInternal = {
          ...config,
          id: ++idRef.current,
          duration: config.duration ?? DEFAULT_DURATION,
        };

        timerRef.current = setTimeout(() => {
          // タイマー満了時に最新の toast が同じ id なら expire。
          setToast((cur) => {
            if (cur && cur.id === next.id) {
              animateOut(() => {
                setToast(null);
                void cur.onExpire?.();
              });
              return cur;
            }
            return cur;
          });
        }, next.duration);

        return next;
      });
    },
    [animateOut, clearTimer],
  );

  const dismiss = useCallback(() => {
    clearTimer();
    setToast((cur) => {
      if (cur) {
        animateOut(() => setToast(null));
      }
      return null;
    });
  }, [animateOut, clearTimer]);

  useEffect(() => {
    if (toast) {
      animateIn();
    }
  }, [toast, animateIn]);

  useEffect(() => clearTimer, [clearTimer]);

  const value = useMemo<UndoToastContextValue>(() => ({ showUndoToast, dismiss }), [showUndoToast, dismiss]);

  const translateY = slide.interpolate({ inputRange: [0, 1], outputRange: [80, 0] });
  const bottomOffset = Math.max(insets.bottom, 16) + 100;

  return (
    <UndoToastContext.Provider value={value}>
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        {children}
        {toast ? (
          <Animated.View
            pointerEvents="box-none"
            style={[
              styles.host,
              { bottom: bottomOffset, opacity, transform: [{ translateY }] },
            ]}
          >
            <View style={styles.toast}>
              <Ionicons name="trash-outline" size={18} color={colors.paper} style={styles.icon} />
              <Text selectable style={styles.label} numberOfLines={1}>
                {toast.label}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="元に戻す"
                style={styles.undoButton}
                onPress={() => {
                  clearTimer();
                  const current = toast;
                  setToast(null);
                  animateOut(() => {
                    void current.onUndo();
                  });
                }}
              >
                <Text style={styles.undoText}>元に戻す</Text>
              </Pressable>
            </View>
          </Animated.View>
        ) : null}
      </View>
    </UndoToastContext.Provider>
  );
}

export function useUndoToast() {
  const ctx = useContext(UndoToastContext);
  if (!ctx) {
    throw new Error('useUndoToast must be used inside UndoToastProvider');
  }
  return ctx;
}

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    alignItems: 'center',
  },
  toast: {
    width: '100%',
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: '#3F2B16',
    boxShadow: shadows.button,
  },
  icon: {
    marginRight: spacing.sm,
  },
  label: {
    flex: 1,
    color: colors.paper,
    fontSize: 14,
    fontWeight: '700',
  },
  undoButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.round,
    backgroundColor: 'rgba(255, 245, 226, 0.14)',
  },
  undoText: {
    color: colors.accentGoldLight,
    fontSize: 14,
    fontWeight: '900',
  },
});
