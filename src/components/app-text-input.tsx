import { forwardRef } from 'react';
import { TextInput, type TextInputProps } from 'react-native';

import { colors } from '@/theme';

/** 共通 TextInput（selection/cursor/placeholder の色を統一）。 */
export const AppTextInput = forwardRef<TextInput, TextInputProps>(function AppTextInput(
  { selectionColor, cursorColor, placeholderTextColor, ...props },
  ref,
) {
  return (
    <TextInput
      ref={ref}
      selectionColor={selectionColor ?? colors.accentTealDark}
      cursorColor={cursorColor ?? colors.accentTealDark}
      placeholderTextColor={placeholderTextColor ?? colors.textMuted}
      {...props}
    />
  );
});

