import { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Headphones, ListChecks, Volume2 } from 'lucide-react-native';

import { Screen } from '@/components/ui/Screen';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useStartListeningTestMutation } from '@/redux/api/listeningTestApi';

export default function ListeningLandingScreen() {
  const [startListeningTest, { isLoading }] = useStartListeningTestMutation();
  const [error, setError] = useState<string | null>(null);

  const handleStart = async () => {
    setError(null);
    try {
      const res = await startListeningTest().unwrap();
      router.push(`/listening/${res.data.session.id}/test`);
    } catch (err) {
      const message = (err as { data?: { message?: string } })?.data?.message ?? 'Could not start the test';
      setError(message);
      Alert.alert('Something went wrong', message);
    }
  };

  return (
    <Screen scroll className="px-6 pt-6">
      <View className="mb-6 h-14 w-14 items-center justify-center rounded-full bg-teal/10">
        <Headphones size={26} color="#06D6A0" strokeWidth={2} />
      </View>
      <Text className="mb-2 text-3xl font-extrabold text-black dark:text-white">Listening</Text>
      <Text className="mb-6 text-base text-black/60 dark:text-white/60">
        Four sequential sections with authentic accents, scored the moment you finish.
      </Text>

      <Card className="mb-6 gap-3">
        <View className="flex-row items-center">
          <ListChecks size={18} color="#06D6A0" />
          <Text className="ml-3 text-black dark:text-white">4 sections · 40 questions</Text>
        </View>
        <View className="flex-row items-center">
          <Volume2 size={18} color="#06D6A0" />
          <Text className="ml-3 text-black dark:text-white">Each section plays once, no rewind</Text>
        </View>
      </Card>

      <Text className="mb-6 text-xs text-black/50 dark:text-white/50">
        Use headphones and find a quiet spot before you start — you won&apos;t be able to replay any audio.
      </Text>

      {error ? <Text className="mb-4 text-sm text-danger">{error}</Text> : null}

      <Button fullWidth loading={isLoading} onPress={handleStart}>
        Start Listening Test
      </Button>
    </Screen>
  );
}
