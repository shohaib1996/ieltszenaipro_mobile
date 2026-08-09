import { Text, View } from 'react-native';
import { router } from 'expo-router';
import { MailQuestionMark } from 'lucide-react-native';

import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/Button';

/**
 * There is no self-serve, unauthenticated password-reset flow on the backend today —
 * `/users/reset-password` requires an authenticated session plus the current password
 * (it's a "change password" endpoint, not "forgot password"). Rather than fake a flow
 * against an endpoint that doesn't exist, this screen is honest about the limitation.
 * Once signed in, a real change-password flow is available from Settings.
 */
export default function ForgotPasswordScreen() {
  return (
    <Screen className="items-center justify-center px-8">
      <View className="mb-6 h-16 w-16 items-center justify-center rounded-full bg-teal/10">
        <MailQuestionMark size={28} color="#06D6A0" strokeWidth={1.75} />
      </View>
      <Text className="mb-3 text-center text-2xl font-bold text-black dark:text-white">
        Password reset isn&apos;t self-serve yet
      </Text>
      <Text className="mb-8 text-center text-base text-black/60 dark:text-white/60">
        We don&apos;t have automated email password resets available right now. If you&apos;re
        locked out of your account, please reach out to your administrator for help.
      </Text>
      <Button variant="secondary" fullWidth onPress={() => router.back()}>
        Back to Sign In
      </Button>
    </Screen>
  );
}
