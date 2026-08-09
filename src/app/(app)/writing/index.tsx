import { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Clock, FileText, PenTool } from 'lucide-react-native';

import { Screen } from '@/components/ui/Screen';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useStartWritingTestMutation } from '@/redux/api/writingTestApi';

export default function WritingLandingScreen() {
  const [startWritingTest, { isLoading }] = useStartWritingTestMutation();
  const [error, setError] = useState<string | null>(null);

  const handleStart = async () => {
    setError(null);
    try {
      const res = await startWritingTest().unwrap();
      router.push(`/writing/${res.data.session.id}/test`);
    } catch (err) {
      const message = (err as { data?: { message?: string } })?.data?.message ?? 'Could not start the test';
      setError(message);
      Alert.alert('Something went wrong', message);
    }
  };

  return (
    <Screen scroll className="px-6 pt-6">
      <View className="mb-6 h-14 w-14 items-center justify-center rounded-full bg-teal/10">
        <PenTool size={26} color="#06D6A0" strokeWidth={2} />
      </View>
      <Text className="mb-2 text-3xl font-extrabold text-black dark:text-white">Writing</Text>
      <Text className="mb-6 text-base text-black/60 dark:text-white/60">
        Task 1 chart description and a Task 2 essay, graded on all four official band
        criteria.
      </Text>

      <Card className="mb-6 gap-3">
        <View className="flex-row items-center">
          <FileText size={18} color="#06D6A0" />
          <Text className="ml-3 text-black dark:text-white">Task 1 (150+ words) + Task 2 (250+ words)</Text>
        </View>
        <View className="flex-row items-center">
          <Clock size={18} color="#06D6A0" />
          <Text className="ml-3 text-black dark:text-white">60 minutes, once started</Text>
        </View>
      </Card>

      {error ? <Text className="mb-4 text-sm text-danger">{error}</Text> : null}

      <Button fullWidth loading={isLoading} onPress={handleStart}>
        Start Writing Test
      </Button>
    </Screen>
  );
}
