import '@/global.css';

import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { colorScheme as nwColorScheme, useColorScheme } from 'nativewind';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from '@expo-google-fonts/inter';

import { store, persistor } from '@/redux/store';
import { useAppSelector } from '@/redux/hooks';
import { useAuthBootstrap } from '@/hooks/useAuthBootstrap';

SplashScreen.preventAutoHideAsync();

/** Keeps NativeWind's active color scheme in sync with the persisted Settings preference. */
function ThemeSync() {
  const themePreference = useAppSelector((s) => s.settings.themePreference);

  useEffect(() => {
    nwColorScheme.set(themePreference);
  }, [themePreference]);

  return null;
}

function RootNavigator() {
  const { colorScheme } = useColorScheme();
  const token = useAppSelector((s) => s.auth.token);
  const isBootstrapping = useAppSelector((s) => s.auth.isBootstrapping);
  useAuthBootstrap();

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  const ready = fontsLoaded && !isBootstrapping;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <>
      <ThemeSync />
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={Boolean(token)}>
          <Stack.Screen name="(app)" />
        </Stack.Protected>
        <Stack.Protected guard={!token}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaProvider>
            <RootNavigator />
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </PersistGate>
    </Provider>
  );
}
