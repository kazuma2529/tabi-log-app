import { ActionSheetIOS, Alert, Platform } from 'react-native';

const FEATURED_DELETE_MESSAGE = '削除しますか？';

type ShowMediaActionSheetOptions = {
  onMoveToFront: () => void;
  onDelete: () => void;
};

type ShowFeaturedDeleteActionSheetOptions = {
  onDelete: () => void;
};

export function showFeaturedDeleteActionSheet({ onDelete }: ShowFeaturedDeleteActionSheetOptions) {
  if (Platform.OS === 'ios') {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        title: FEATURED_DELETE_MESSAGE,
        options: ['削除', 'キャンセル'],
        destructiveButtonIndex: 0,
      },
      (index) => {
        if (index === 0) onDelete();
      },
    );
    return;
  }

  Alert.alert(FEATURED_DELETE_MESSAGE, undefined, [
    { text: '削除', style: 'destructive', onPress: onDelete },
    { text: 'キャンセル', style: 'cancel' },
  ]);
}

export function showMediaActionSheet({ onMoveToFront, onDelete }: ShowMediaActionSheetOptions) {
  if (Platform.OS === 'ios') {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ['先頭に移動', '削除', 'キャンセル'],
        destructiveButtonIndex: 1,
        cancelButtonIndex: 2,
      },
      (index) => {
        if (index === 0) onMoveToFront();
        if (index === 1) onDelete();
      },
    );
    return;
  }

  Alert.alert('メディアの操作', undefined, [
    { text: '先頭に移動', onPress: onMoveToFront },
    { text: '削除', style: 'destructive', onPress: onDelete },
    { text: 'キャンセル', style: 'cancel' },
  ]);
}
