import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Text, View } from 'react-native';
import { Link, router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Screen } from '@/components/ui/Screen';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useRegisterUserMutation } from '@/redux/api/usersApi';

const schema = z
  .object({
    name: z.string().min(2, 'Enter your full name'),
    email: z.string().email('Enter a valid email address'),
    password: z.string().min(6, 'At least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
type FormValues = z.infer<typeof schema>;

export default function RegisterScreen() {
  const [registerUser, { isLoading }] = useRegisterUserMutation();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async ({ name, email, password }: FormValues) => {
    setServerError(null);
    try {
      const res = await registerUser({ name, email, password }).unwrap();
      if (res.success) {
        router.replace({ pathname: '/(auth)/login', params: { registered: '1' } });
      }
    } catch (err) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ?? 'Could not create your account';
      setServerError(message);
    }
  };

  return (
    <Screen scroll className="px-6">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 justify-center py-12"
      >
        <Text className="mb-2 text-3xl font-extrabold text-black dark:text-white">Create your account</Text>
        <Text className="mb-8 text-base text-black/60 dark:text-white/60">
          Start practicing for IELTS with AI-graded mock tests.
        </Text>

        <View className="gap-4">
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Full name"
                placeholder="Jane Doe"
                autoComplete="name"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.name?.message}
              />
            )}
          />
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
                placeholder="At least 6 characters"
                secureTextEntry
                autoCapitalize="none"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.password?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Confirm password"
                placeholder="Re-enter your password"
                secureTextEntry
                autoCapitalize="none"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.confirmPassword?.message}
              />
            )}
          />
        </View>

        {serverError ? <Text className="mb-4 mt-4 text-sm text-danger">{serverError}</Text> : null}

        <Button className="mt-6" onPress={handleSubmit(onSubmit)} loading={isLoading} fullWidth>
          Sign Up
        </Button>

        <View className="mt-6 flex-row justify-center">
          <Text className="text-black/60 dark:text-white/60">Already have an account? </Text>
          <Link href="/(auth)/login" className="font-semibold text-navy dark:text-teal">
            Sign in
          </Link>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
