import { Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';
import { ChartColumn, House, Settings } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';

import { BrandColors } from '@/constants/theme';

export default function TabsLayout() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: BrandColors.teal,
        tabBarInactiveTintColor: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(10,15,30,0.45)',
        tabBarShowLabel: true,
        tabBarStyle: {
          position: Platform.OS === 'ios' ? 'absolute' : undefined,
          borderTopWidth: 0,
          elevation: 0,
          backgroundColor: Platform.OS === 'ios' ? 'transparent' : isDark ? BrandColors.ink : BrandColors.white,
        },
        // iOS: translucent blur reads as native iOS tab-bar chrome. Android keeps a
        // solid Material-style surface — matches the design doc's "respect native
        // platform conventions" rule rather than one skin stretched over both.
        tabBarBackground:
          Platform.OS === 'ios'
            ? () => <BlurView intensity={80} tint={isDark ? 'dark' : 'light'} style={{ flex: 1 }} />
            : undefined,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <House color={color} size={size} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ color, size }) => <ChartColumn color={color} size={size} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => <Settings color={color} size={size} strokeWidth={2} />,
        }}
      />
    </Tabs>
  );
}
