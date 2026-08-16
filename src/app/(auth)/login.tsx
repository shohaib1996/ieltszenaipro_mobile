import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import Svg, { Path } from 'react-native-svg';

import { Screen } from '@/components/ui/Screen';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useGoogleLoginMutation, useLoginUserMutation } from '@/redux/api/usersApi';
import { useAppDispatch } from '@/redux/hooks';
import { login } from '@/redux/features/authSlice';
import { secureStorage } from '@/lib/secureStorage';
import type { IUser } from '@/redux/features/authSlice';

// Required by expo-auth-session so the in-app browser closes itself and returns
// control to the app once Google redirects back with the result.
WebBrowser.maybeCompleteAuthSession();

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});
type FormValues = z.infer<typeof schema>;

function GoogleIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      <Path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <Path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <Path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <Path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </Svg>
  );
}

export default function LoginScreen() {
  const dispatch = useAppDispatch();
  const [loginUser, { isLoading }] = useLoginUserMutation();
  const [googleLogin, { isLoading: isGoogleLoading }] = useGoogleLoginMutation();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const persistAndLogin = async (accessToken: string, rawUser: IUser) => {
    // The API response includes extra fields (e.g. the bcrypt password hash) that
    // have no business leaving the server, let alone sitting in on-device storage —
    // pick only the fields the app actually needs before persisting/storing them.
    const { id, name, email, role, avatarUrl } = rawUser;
    const user = { id, name, email, role, avatarUrl };
    await secureStorage.saveSession(accessToken, user);
    dispatch(login({ user, token: accessToken }));
  };

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    try {
      const res = await loginUser(values).unwrap();
      await persistAndLogin(res.data.accessToken, res.data.user);
    } catch (err) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ?? 'Invalid email or password';
      setServerError(message);
    }
  };

  const [googleRequest, googleResponse, promptGoogleAsync] = Google.useIdTokenAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
  });

  useEffect(() => {
    if (googleResponse?.type !== 'success') return;
    const idToken = googleResponse.params.id_token;
    if (!idToken) return;

    (async () => {
      setServerError(null);
      try {
        // The backend finds-or-creates by the token's verified email: an existing
        // account signs straight in, a new one is created and signed in - same
        // single endpoint either way, no separate "sign up with Google" step.
        const res = await googleLogin({ idToken }).unwrap();
        await persistAndLogin(res.data.accessToken, res.data.user);
      } catch (err) {
        const message =
          (err as { data?: { message?: string } })?.data?.message ?? 'Google sign-in failed';
        setServerError(message);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [googleResponse]);

  return (
    <Screen scroll className="px-6">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 justify-center py-12"
      >
        <Text className="mb-2 text-3xl font-extrabold text-black dark:text-white">Welcome back</Text>
        <Text className="mb-8 text-base text-black/60 dark:text-white/60">
          Sign in to continue your IELTS prep.
        </Text>

        <Button
          variant="secondary"
          fullWidth
          icon={<GoogleIcon />}
          loading={isGoogleLoading}
          disabled={!googleRequest}
          onPress={() => promptGoogleAsync()}
        >
          Continue with Google
        </Button>

        <View className="my-6 flex-row items-center gap-3">
          <View className="h-px flex-1 bg-black/10 dark:bg-white/10" />
          <Text className="text-xs text-black/40 dark:text-white/40">OR CONTINUE WITH EMAIL</Text>
          <View className="h-px flex-1 bg-black/10 dark:bg-white/10" />
        </View>

        <View className="gap-4">
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Email"
                placeholder="you@example.com"
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.email?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Password"
                placeholder="••••••••"
                secureTextEntry
                autoCapitalize="none"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.password?.message}
              />
            )}
          />
        </View>

        <Link href="/(auth)/forgot-password" className="mb-6 mt-3 self-end text-sm font-medium text-navy dark:text-teal">
          Forgot password?
        </Link>

        {serverError ? <Text className="mb-4 text-sm text-danger">{serverError}</Text> : null}

        <Button onPress={handleSubmit(onSubmit)} loading={isLoading} fullWidth>
          Sign In
        </Button>

        <View className="mt-6 flex-row justify-center">
          <Text className="text-black/60 dark:text-white/60">Don&apos;t have an account? </Text>
          <Link href="/(auth)/register" className="font-semibold text-navy dark:text-teal">
            Sign up
          </Link>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
