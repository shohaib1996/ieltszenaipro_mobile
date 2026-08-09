import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';

import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/Button';
import { useCountdown } from '@/hooks/useCountdown';
import { cn } from '@/lib/utils';
import { useGetWritingTestQuery, useSubmitWritingTestMutation } from '@/redux/api/writingTestApi';
import type { WritingTaskType } from '@/types/writing';

const TEST_DURATION_MS = 60 * 60 * 1000;
const MIN_WORDS: Record<WritingTaskType, number> = { TASK1: 150, TASK2: 250 };

const countWords = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

export default function WritingTestScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const { data, isLoading } = useGetWritingTestQuery(sessionId);
  const [submitWritingTest, { isLoading: isSubmitting }] = useSubmitWritingTestMutation();

  const [activeTask, setActiveTask] = useState<WritingTaskType>('TASK1');
  const [task1Text, setTask1Text] = useState('');
  const [task2Text, setTask2Text] = useState('');

  const session = data?.data?.session;
  const task1 = data?.data?.task1;
  const task2 = data?.data?.task2;

  const deadline = useMemo(
    () => (session ? new Date(session.startedAt).getTime() + TEST_DURATION_MS : Date.now() + TEST_DURATION_MS),
    [session],
  );

  const handleSubmit = async () => {
    try {
      await submitWritingTest({ sessionId, task1Text, task2Text }).unwrap();
      router.replace(`/writing/${sessionId}/results`);
    } catch (err) {
      const message = (err as { data?: { message?: string } })?.data?.message ?? 'Could not submit your test';
      Alert.alert('Submission failed', message);
    }
  };

  const { label: timeLabel, isExpired } = useCountdown(deadline, () => {
    if (!isSubmitting) handleSubmit();
  });

  const confirmSubmit = () => {
    Alert.alert(
      'Submit writing test?',
      "You can't change your answers after submitting. Both tasks will be graded together.",
      [
        { text: 'Keep working', style: 'cancel' },
        { text: 'Submit', style: 'destructive', onPress: handleSubmit },
      ],
    );
  };

  if (isLoading || !task1 || !task2) {
    return (
      <Screen className="items-center justify-center">
        <ActivityIndicator color="#06D6A0" />
      </Screen>
    );
  }

  const activePayload = activeTask === 'TASK1' ? task1 : task2;
  const activeText = activeTask === 'TASK1' ? task1Text : task2Text;
  const setActiveText = activeTask === 'TASK1' ? setTask1Text : setTask2Text;
  const wordCount = countWords(activeText);
  const minWords = MIN_WORDS[activeTask];

  return (
    <Screen className="pt-2">
      <View className="flex-row items-center justify-between px-4 pb-3">
        <Pressable
          onPress={() =>
            Alert.alert('Leave test?', 'Your progress on this attempt will be lost.', [
              { text: 'Stay', style: 'cancel' },
              { text: 'Leave', style: 'destructive', onPress: () => router.back() },
            ])
          }
          hitSlop={8}
        >
          <ChevronLeft size={24} color="#06D6A0" />
        </Pressable>
        <View className={cn('rounded-full px-3 py-1', isExpired ? 'bg-danger' : 'bg-teal')}>
          <Text className="text-sm font-bold text-ink">{timeLabel}</Text>
        </View>
      </View>

      <View className="flex-row gap-2 border-b border-black/5 px-4 pb-3 dark:border-white/5">
        {(['TASK1', 'TASK2'] as const).map((t) => (
          <Pressable
            key={t}
            onPress={() => setActiveTask(t)}
            className={cn('rounded-full px-4 py-2', activeTask === t ? 'bg-teal' : 'bg-black/5 dark:bg-white/10')}
          >
            <Text className={cn('text-sm font-semibold', activeTask === t ? 'text-ink' : 'text-black dark:text-white')}>
              {t === 'TASK1' ? 'Task 1' : 'Task 2'}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView className="flex-1 px-4 pt-4" contentContainerStyle={{ paddingBottom: 24 }}>
        <Text className="mb-3 text-base leading-6 text-black/80 dark:text-white/80">{activePayload.promptText}</Text>

        {activeTask === 'TASK1' && activePayload.imageUrl ? (
          <Image
            source={{ uri: activePayload.imageUrl }}
            className="mb-4 h-56 w-full rounded-card bg-black/5 dark:bg-white/10"
            resizeMode="contain"
          />
        ) : null}

        <TextInput
          multiline
          textAlignVertical="top"
          placeholder={activeTask === 'TASK1' ? 'Describe the chart in your own words…' : 'Write your essay…'}
          placeholderTextColor="#60646C"
          value={activeText}
          onChangeText={setActiveText}
          className="min-h-[220px] rounded-card border border-black/10 bg-white p-4 text-base text-black dark:border-white/10 dark:bg-navy dark:text-white"
        />

        <Text
          className={cn('mt-2 text-right text-xs font-medium', wordCount < minWords ? 'text-danger' : 'text-teal')}
        >
          {wordCount} / {minWords}+ words
        </Text>
      </ScrollView>

      <View className="border-t border-black/5 px-4 py-3 dark:border-white/5">
        <Button fullWidth loading={isSubmitting} onPress={confirmSubmit}>
          Submit Test
        </Button>
      </View>
    </Screen>
  );
}
