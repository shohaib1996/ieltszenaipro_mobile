import { Stack } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { BrandColors } from '@/constants/theme';

export default function SpeakingLayout() {
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
      <Stack.Screen name="index" options={{ title: 'Speaking' }} />
      <Stack.Screen name="[sessionId]/session" options={{ headerShown: false }} />
    </Stack>
  );
}
