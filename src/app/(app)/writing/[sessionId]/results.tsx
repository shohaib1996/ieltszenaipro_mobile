import { ActivityIndicator, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { Screen } from '@/components/ui/Screen';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BandScore } from '@/components/ui/BandScore';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useGetWritingTestQuery } from '@/redux/api/writingTestApi';
import type { WritingCriteriaScores, WritingTaskPayload, WritingTaskType } from '@/types/writing';

function criteriaLabels(task: WritingTaskType) {
  return {
    taskScore: task === 'TASK1' ? 'Task Achievement' : 'Task Response',
    coherenceCohesion: 'Coherence & Cohesion',
    lexicalResource: 'Lexical Resource',
    grammaticalRange: 'Grammatical Range & Accuracy',
  } satisfies Record<keyof WritingCriteriaScores, string>;
}

function TaskResultCard({ title, payload }: { title: string; payload: WritingTaskPayload }) {
  const labels = criteriaLabels(payload.task);
  const scores = payload.criteriaScores;
  return (
    <Card className="mb-4">
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-base font-bold text-black dark:text-white">{title}</Text>
        <Text className="text-xl font-extrabold text-navy dark:text-teal">
          {payload.score != null ? payload.score.toFixed(1) : '—'}
        </Text>
      </View>

      {scores
        ? (Object.keys(labels) as (keyof WritingCriteriaScores)[]).map((key) => (
            <View key={key} className="mb-3">
              <View className="mb-1 flex-row items-center justify-between">
                <Text className="text-sm text-black/70 dark:text-white/70">{labels[key]}</Text>
                <Text className="text-sm font-semibold text-black dark:text-white">{scores[key].toFixed(1)}</Text>
              </View>
              <ProgressBar value={scores[key]} max={9} />
            </View>
          ))
        : null}

      {payload.feedback ? (
        <Text className="mt-2 text-sm leading-5 text-black/70 dark:text-white/70">{payload.feedback}</Text>
      ) : null}
      {payload.wordCount != null ? (
        <Text className="mt-3 text-xs text-black/40 dark:text-white/40">{payload.wordCount} words</Text>
      ) : null}
    </Card>
  );
}

export default function WritingResultsScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const { data, isLoading } = useGetWritingTestQuery(sessionId);

  const session = data?.data?.session;
  const task1 = data?.data?.task1;
  const task2 = data?.data?.task2;

  if (isLoading || !task1 || !task2) {
    return (
      <Screen className="items-center justify-center">
        <ActivityIndicator color="#06D6A0" />
      </Screen>
    );
  }

  return (
    <Screen scroll className="items-center px-6 pt-8">
      <Text className="mb-8 text-center text-lg text-black/60 dark:text-white/60">Writing test complete</Text>

      <BandScore score={session?.score ?? 0} label="Overall writing band" />

      <View className="mt-8 w-full">
        <TaskResultCard title="Task 1" payload={task1} />
        <TaskResultCard title="Task 2" payload={task2} />
      </View>

      <Button className="mt-2" fullWidth onPress={() => router.replace('/(app)/(tabs)')}>
        Back to Home
      </Button>
    </Screen>
  );
}
