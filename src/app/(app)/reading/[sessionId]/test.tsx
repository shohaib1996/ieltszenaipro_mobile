import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';

import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/ErrorState';
import { QuestionAnswerInput } from '@/components/test/QuestionAnswerInput';
import { useCountdown } from '@/hooks/useCountdown';
import { cn } from '@/lib/utils';
import { useGetReadingTestQuery, useSubmitReadingTestMutation } from '@/redux/api/readingTestApi';
import type { ReadingTest, TestSession } from '@/types/test';

const TEST_DURATION_MS = 60 * 60 * 1000;

export default function ReadingTestScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const { data, isLoading } = useGetReadingTestQuery(sessionId);
  const [submitReadingTest, { isLoading: isSubmitting }] = useSubmitReadingTestMutation();

  const [activeIndex, setActiveIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const session: TestSession | undefined = data?.data?.session;
  const readingTest: ReadingTest | undefined = data?.data?.readingTest;

  const deadline = useMemo(
    () => (session ? new Date(session.startedAt).getTime() + TEST_DURATION_MS : Date.now() + TEST_DURATION_MS),
    [session],
  );

  const handleSubmit = async () => {
    try {
      const payload = Object.entries(answers).map(([questionId, answerText]) => ({ questionId, answerText }));
      const res = await submitReadingTest({ sessionId, answers: payload }).unwrap();
      const { band, rawScore, totalQuestions } = res.data;
      router.replace({
        pathname: '/reading/[sessionId]/results',
        params: { sessionId, band: String(band), rawScore: String(rawScore), totalQuestions: String(totalQuestions) },
      });
    } catch (err) {
      const message = (err as { data?: { message?: string } })?.data?.message ?? 'Could not submit your test';
      Alert.alert('Submission failed', message);
    }
  };

  const { label: timeLabel, isExpired } = useCountdown(deadline, () => {
    if (!isSubmitting) handleSubmit();
  });

  const confirmSubmit = () => {
    const answeredCount = Object.keys(answers).length;
    const totalCount = readingTest?.passages.reduce((sum, p) => sum + p.questions.length, 0) ?? 0;
    Alert.alert(
      'Submit reading test?',
      `You've answered ${answeredCount} of ${totalCount} questions. You can't change your answers after submitting.`,
      [
        { text: 'Keep working', style: 'cancel' },
        { text: 'Submit', style: 'destructive', onPress: handleSubmit },
      ],
    );
  };

  if (isLoading || !readingTest || !session) {
    return (
      <Screen className="items-center justify-center">
        <ActivityIndicator color="#06D6A0" />
      </Screen>
    );
  }

  if (readingTest.passages.length === 0) {
    return (
      <Screen>
        <ErrorState
          title="This test couldn't load"
          message="This reading test is missing its passages. Go back and start a new attempt."
          actionLabel="Go back"
          onAction={() => router.back()}
        />
      </Screen>
    );
  }

  const activePassage = readingTest.passages[activeIndex];

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
        {readingTest.passages.map((passage, i) => (
          <Pressable
            key={passage.id}
            onPress={() => setActiveIndex(i)}
            className={cn('rounded-full px-4 py-2', activeIndex === i ? 'bg-teal' : 'bg-black/5 dark:bg-white/10')}
          >
            <Text className={cn('text-sm font-semibold', activeIndex === i ? 'text-ink' : 'text-black dark:text-white')}>
              Passage {i + 1}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView className="flex-1 px-4 pt-4" contentContainerStyle={{ paddingBottom: 24 }}>
        <Text className="mb-2 text-lg font-bold text-black dark:text-white">{activePassage.title}</Text>
        <Text className="mb-6 text-base leading-6 text-black/80 dark:text-white/80">{activePassage.content}</Text>

        {activePassage.questions.map((question, i) => (
          <QuestionAnswerInput
            key={question.id}
            question={question}
            index={i + 1}
            value={answers[question.id]}
            onChange={(value) => setAnswers((prev) => ({ ...prev, [question.id]: value }))}
          />
        ))}
      </ScrollView>

      <View className="border-t border-black/5 px-4 py-3 dark:border-white/5">
        <Button fullWidth loading={isSubmitting} onPress={confirmSubmit}>
          Submit Test
        </Button>
      </View>
    </Screen>
  );
}
