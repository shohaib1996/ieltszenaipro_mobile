import { Stack } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { BrandColors } from '@/constants/theme';

export default function ListeningLayout() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: isDark ? BrandColors.ink : BrandColors.white },
        headerTintColor: isDark ? BrandColors.white : BrandColors.black,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Listening' }} />
      <Stack.Screen name="[sessionId]/test" options={{ headerShown: false }} />
      <Stack.Screen
        name="[sessionId]/results"
        options={{ title: 'Results', headerBackVisible: false, gestureEnabled: false }}
      />
    </Stack>
  );
}
