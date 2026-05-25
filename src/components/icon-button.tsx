import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

import { colors } from '@/theme';

type IconName = keyof typeof Ionicons.glyphMap;

type IconButtonProps = Omit<PressableProps, 'style' | 'children'> & {
  icon: IconName;
  iconSize?: number;
  iconColor?: string;
  style?: StyleProp<ViewStyle>;
};

export function IconButton({ icon, iconSize = 24, iconColor = colors.textPrimary, style, ...props }: IconButtonProps) {
  return (
    <Pressable style={[styles.base, style]} {...props}>
      <Ionicons name={icon} size={iconSize} color={iconColor} />
    </Pressable>
  );
}

export function BackIconButton({ style, ...props }: Omit<IconButtonProps, 'icon'>) {
  return (
    <IconButton
      icon="chevron-back"
      accessibilityRole="button"
      accessibilityLabel="戻る"
      style={style}
      {...props}
    />
  );
}

export function CloseIconButton({ style, iconSize = 22, ...props }: Omit<IconButtonProps, 'icon'>) {
  return (
    <IconButton
      icon="close"
      iconSize={iconSize}
      accessibilityRole="button"
      accessibilityLabel="閉じる"
      style={style}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 21,
    backgroundColor: colors.paper,
    borderColor: colors.border,
    borderWidth: 1,
  },
});
