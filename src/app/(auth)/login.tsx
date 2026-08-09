import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Screen } from '@/components/ui/Screen';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useLoginUserMutation } from '@/redux/api/usersApi';
import { useAppDispatch } from '@/redux/hooks';
import { login } from '@/redux/features/authSlice';
import { secureStorage } from '@/lib/secureStorage';

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});
type FormValues = z.infer<typeof schema>;

export default function LoginScreen() {
  const dispatch = useAppDispatch();
  const [loginUser, { isLoading }] = useLoginUserMutation();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    try {
      const res = await loginUser(values).unwrap();
      const { accessToken } = res.data;
      // The API response includes extra fields (e.g. the bcrypt password hash) that
      // have no business leaving the server, let alone sitting in on-device storage —
      // pick only the fields the app actually needs before persisting/storing them.
      const { id, name, email, role, avatarUrl } = res.data.user;
      const user = { id, name, email, role, avatarUrl };
      await secureStorage.saveSession(accessToken, user);
      dispatch(login({ user, token: accessToken }));
    } catch (err) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ?? 'Invalid email or password';
      setServerError(message);
    }
  };

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
