import { useState } from 'react';
import { Text, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LogOut, Moon, Smartphone, Sun } from 'lucide-react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

import { Screen } from '@/components/ui/Screen';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { logout } from '@/redux/features/authSlice';
import { setThemePreference, type ThemePreference } from '@/redux/features/settingsSlice';
import { useResetPasswordMutation } from '@/redux/api/usersApi';
import { secureStorage } from '@/lib/secureStorage';

const THEME_OPTIONS: { value: ThemePreference; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Smartphone },
];

const passwordSchema = z
  .object({
    oldPassword: z.string().min(1, 'Enter your current password'),
    newPassword: z.string().min(6, 'At least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function SettingsScreen() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const themePreference = useAppSelector((s) => s.settings.themePreference);
  const [resetPassword, { isLoading: isSavingPassword }] = useResetPasswordMutation();
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { oldPassword: '', newPassword: '', confirmPassword: '' },
  });

  const onChangePassword = async ({ oldPassword, newPassword }: PasswordFormValues) => {
    setPasswordMessage(null);
    try {
      await resetPassword({ oldPassword, newPassword }).unwrap();
      setPasswordMessage({ type: 'success', text: 'Password updated successfully.' });
      reset();
    } catch (err) {
      const message = (err as { data?: { message?: string } })?.data?.message ?? 'Could not update password';
      setPasswordMessage({ type: 'error', text: message });
    }
  };

  const handleLogout = async () => {
    // Play Services otherwise keeps considering the user "signed in" for this app,
    // silently reusing that account on the next login instead of showing the picker.
    try {
      await GoogleSignin.signOut();
    } catch {
      // Not signed in via Google, or Play Services unavailable - fine either way.
    }
    await secureStorage.clearSession();
    dispatch(logout());
  };

  return (
    <Screen scroll className="px-6 pb-28 pt-4">
      <Text className="mb-6 text-2xl font-extrabold text-black dark:text-white">Settings</Text>

      <Card className="mb-6">
        <Text className="text-lg font-bold text-black dark:text-white">{user?.name ?? 'Student'}</Text>
        <Text className="text-sm text-black/60 dark:text-white/60">{user?.email}</Text>
      </Card>

      <Text className="mb-3 text-base font-bold text-black dark:text-white">Appearance</Text>
      <View className="mb-6 flex-row gap-2">
        {THEME_OPTIONS.map(({ value, label, icon: Icon }) => {
          const active = themePreference === value;
          return (
            <Button
              key={value}
              variant={active ? 'primary' : 'secondary'}
              size="sm"
              className="flex-1"
              icon={<Icon size={16} color={active ? '#0A0F1E' : undefined} />}
              onPress={() => dispatch(setThemePreference(value))}
            >
              {label}
            </Button>
          );
        })}
      </View>

      <Text className="mb-3 text-base font-bold text-black dark:text-white">Change password</Text>
      <Card className="mb-6 gap-3">
        <Controller
          control={control}
          name="oldPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Current password"
              secureTextEntry
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.oldPassword?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="newPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="New password"
              secureTextEntry
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.newPassword?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Confirm new password"
              secureTextEntry
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.confirmPassword?.message}
            />
          )}
        />
        {passwordMessage ? (
          <Text className={cn('text-sm', passwordMessage.type === 'error' ? 'text-danger' : 'text-teal')}>
            {passwordMessage.text}
          </Text>
        ) : null}
        <Button size="sm" loading={isSavingPassword} onPress={handleSubmit(onChangePassword)}>
          Update password
        </Button>
      </Card>

      <Button variant="destructive" icon={<LogOut size={18} color="#ffffff" />} onPress={handleLogout}>
        Log out
      </Button>
    </Screen>
  );
}
