import { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Clock, ListChecks, Sparkles } from 'lucide-react-native';

import { Screen } from '@/components/ui/Screen';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useStartReadingTestMutation } from '@/redux/api/readingTestApi';

export default function ReadingLandingScreen() {
  const [startReadingTest, { isLoading }] = useStartReadingTestMutation();
  const [error, setError] = useState<string | null>(null);

  const handleStart = async () => {
    setError(null);
    try {
      const res = await startReadingTest().unwrap();
      router.push(`/reading/${res.data.session.id}/test`);
    } catch (err) {
      const message = (err as { data?: { message?: string } })?.data?.message ?? 'Could not start the test';
      setError(message);
      Alert.alert('Something went wrong', message);
    }
  };

  return (
    <Screen scroll className="px-6 pt-6">
      <View className="mb-6 h-14 w-14 items-center justify-center rounded-full bg-teal/10">
        <Sparkles size={26} color="#06D6A0" strokeWidth={2} />
      </View>
      <Text className="mb-2 text-3xl font-extrabold text-black dark:text-white">Reading</Text>
      <Text className="mb-6 text-base text-black/60 dark:text-white/60">
        Three passages of increasing difficulty, scored against the real Academic Reading
        band table.
      </Text>

      <Card className="mb-6 gap-3">
        <View className="flex-row items-center">
          <ListChecks size={18} color="#06D6A0" />
          <Text className="ml-3 text-black dark:text-white">3 passages · 40 questions</Text>
        </View>
        <View className="flex-row items-center">
          <Clock size={18} color="#06D6A0" />
          <Text className="ml-3 text-black dark:text-white">60 minutes, once started</Text>
        </View>
      </Card>

      {error ? <Text className="mb-4 text-sm text-danger">{error}</Text> : null}

      <Button fullWidth loading={isLoading} onPress={handleStart}>
        Start Reading Test
      </Button>
    </Screen>
  );
}
