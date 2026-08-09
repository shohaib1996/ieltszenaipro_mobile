import { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Mic, Timer, Users } from 'lucide-react-native';

import { Screen } from '@/components/ui/Screen';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useStartSpeakingTestMutation } from '@/redux/api/speakingTestApi';

export default function SpeakingLandingScreen() {
  const [startSpeakingTest, { isLoading }] = useStartSpeakingTestMutation();
  const [error, setError] = useState<string | null>(null);

  const handleStart = async () => {
    setError(null);
    try {
      const res = await startSpeakingTest().unwrap();
      router.push(`/speaking/${res.data.session.id}/session`);
    } catch (err) {
      const message = (err as { data?: { message?: string } })?.data?.message ?? 'Could not start the test';
      setError(message);
      Alert.alert('Something went wrong', message);
    }
  };

  return (
    <Screen scroll className="px-6 pt-6">
      <View className="mb-6 h-14 w-14 items-center justify-center rounded-full bg-teal/10">
        <Mic size={26} color="#06D6A0" strokeWidth={2} />
      </View>
      <Text className="mb-2 text-3xl font-extrabold text-black dark:text-white">Speaking</Text>
      <Text className="mb-6 text-base text-black/60 dark:text-white/60">
        A live conversation with an AI examiner across all three real IELTS Speaking parts.
      </Text>

      <Card className="mb-6 gap-3">
        <View className="flex-row items-center">
          <Users size={18} color="#06D6A0" />
          <Text className="ml-3 text-black dark:text-white">Part 1 intro, Part 2 cue card, Part 3 discussion</Text>
        </View>
        <View className="flex-row items-center">
          <Timer size={18} color="#06D6A0" />
          <Text className="ml-3 text-black dark:text-white">About 11-14 minutes</Text>
        </View>
      </Card>

      <Text className="mb-6 text-xs text-black/50 dark:text-white/50">
        You&apos;ll be asked to allow microphone access. Find a quiet spot — your answers are
        recorded and transcribed to be graded.
      </Text>

      {error ? <Text className="mb-4 text-sm text-danger">{error}</Text> : null}

      <Button fullWidth loading={isLoading} onPress={handleStart}>
        Start Speaking Test
      </Button>
    </Screen>
  );
}
