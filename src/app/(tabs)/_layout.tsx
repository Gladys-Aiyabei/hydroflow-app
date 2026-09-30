import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fonts } from '@/theme';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.onSurface,
        tabBarLabelStyle: { fontFamily: fonts.displaySemi, fontSize: 11, letterSpacing: 0.4 },
        tabBarStyle: {
          backgroundColor: colors.surfaceContainerLowest,
          borderTopColor: colors.slate200,
          height: 64 + Math.max(insets.bottom, Platform.OS === 'web' ? 0 : 8),
          paddingTop: 8,
        },
        sceneStyle: { backgroundColor: colors.surface },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Dashboard', tabBarIcon: ({ color }) => <MaterialIcons name="dashboard" size={24} color={color} /> }}
      />
      <Tabs.Screen
        name="orders"
        options={{ title: 'Orders', tabBarIcon: ({ color }) => <MaterialIcons name="receipt-long" size={24} color={color} /> }}
      />
      <Tabs.Screen
        name="tracking"
        options={{ title: 'Tracking', tabBarIcon: ({ color }) => <MaterialCommunityIcons name="truck-outline" size={26} color={color} /> }}
      />
      <Tabs.Screen
        name="delivery"
        options={{ title: 'Delivery', tabBarIcon: ({ color }) => <MaterialCommunityIcons name="water-outline" size={26} color={color} /> }}
      />
    </Tabs>
  );
}
