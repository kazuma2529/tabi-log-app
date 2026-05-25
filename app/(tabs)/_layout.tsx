import { Ionicons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, radius, shadows } from '@/theme';

export default function TabsLayout() {
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accentTealDark,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: styles.label,
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabItem,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'ホーム',
          tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: '地図',
          tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? 'map' : 'map-outline'} size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="add-button"
        options={{
          title: '',
          tabBarLabel: () => null,
          tabBarButton: () => (
            <Pressable accessibilityRole="button" accessibilityLabel="訪問記録を追加" style={styles.addButtonWrap} onPress={() => router.push('/add')}>
              <View style={styles.addButton}>
                <Ionicons name="add" size={32} color={colors.white} />
              </View>
            </Pressable>
          ),
        }}
      />
      <Tabs.Screen
        name="diary"
        options={{
          title: '記録',
          tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? 'journal' : 'journal-outline'} size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: '統計',
          tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? 'stats-chart' : 'stats-chart-outline'} size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 10,
    height: 74,
    borderTopWidth: 0,
    borderRadius: radius.xl,
    backgroundColor: 'rgba(255, 247, 231, 0.96)',
    borderColor: colors.border,
    borderWidth: 1,
    paddingTop: 8,
    paddingBottom: 9,
    boxShadow: shadows.card,
  },
  tabItem: {
    minHeight: 56,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0,
  },
  addButtonWrap: {
    width: 68,
    height: 76,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 0,
  },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentGold,
    borderWidth: 3,
    borderColor: '#F7E6C3',
    boxShadow: shadows.button,
  },
});
