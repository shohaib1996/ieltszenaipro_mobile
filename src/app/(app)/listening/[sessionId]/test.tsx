import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Check, ChevronLeft } from 'lucide-react-native';

import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/ErrorState';
import { QuestionAnswerInput } from '@/components/test/QuestionAnswerInput';
import { SinglePlayAudioButton } from '@/components/test/SinglePlayAudioButton';
import { cn } from '@/lib/utils';
import { useGetListeningTestQuery, useSubmitListeningTestMutation } from '@/redux/api/listeningTestApi';

export default function ListeningTestScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const { data, isLoading } = useGetListeningTestQuery(sessionId);
  const [submitListeningTest, { isLoading: isSubmitting }] = useSubmitListeningTestMutation();

  const [activeIndex, setActiveIndex] = useState(0);
  const [playedSections, setPlayedSections] = useState<Record<number, boolean>>({});
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const listeningTest = data?.data?.listeningTest;

  const handleSubmit = async () => {
    try {
      const payload = Object.entries(answers).map(([questionId, answerText]) => ({ questionId, answerText }));
      const res = await submitListeningTest({ sessionId, answers: payload }).unwrap();
      const { band, rawScore, totalQuestions } = res.data;
      router.replace({
        pathname: '/listening/[sessionId]/results',
        params: { sessionId, band: String(band), rawScore: String(rawScore), totalQuestions: String(totalQuestions) },
      });
    } catch (err) {
      const message = (err as { data?: { message?: string } })?.data?.message ?? 'Could not submit your test';
      Alert.alert('Submission failed', message);
    }
  };

  const confirmSubmit = () => {
    const answeredCount = Object.keys(answers).length;
    const totalCount = listeningTest?.sections.reduce((sum, s) => sum + s.questions.length, 0) ?? 0;
    Alert.alert(
      'Submit listening test?',
      `You've answered ${answeredCount} of ${totalCount} questions. You can't change your answers after submitting.`,
      [
        { text: 'Keep working', style: 'cancel' },
        { text: 'Submit', style: 'destructive', onPress: handleSubmit },
      ],
    );
  };

  if (isLoading || !listeningTest) {
    return (
      <Screen className="items-center justify-center">
        <ActivityIndicator color="#06D6A0" />
      </Screen>
    );
  }

  if (listeningTest.sections.length === 0) {
    return (
      <Screen>
        <ErrorState
          title="This test couldn't load"
          message="This listening test is missing its audio sections. Go back and start a new attempt."
          actionLabel="Go back"
          onAction={() => router.back()}
        />
      </Screen>
    );
  }

  const activeSection = listeningTest.sections[activeIndex];
  const isLastSection = activeIndex === listeningTest.sections.length - 1;

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
        <Text className="text-sm font-semibold text-black/60 dark:text-white/60">
          Section {activeIndex + 1} of {listeningTest.sections.length}
        </Text>
      </View>

      <View className="flex-row gap-2 border-b border-black/5 px-4 pb-3 dark:border-white/5">
        {listeningTest.sections.map((section, i) => (
          <Pressable
            key={section.id}
            onPress={() => setActiveIndex(i)}
            className={cn('flex-row items-center gap-1 rounded-full px-4 py-2', activeIndex === i ? 'bg-teal' : 'bg-black/5 dark:bg-white/10')}
          >
            {playedSections[i] ? (
              <Check size={12} color={activeIndex === i ? '#0A0F1E' : '#06D6A0'} />
            ) : null}
            <Text className={cn('text-sm font-semibold', activeIndex === i ? 'text-ink' : 'text-black dark:text-white')}>
              {i + 1}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView className="flex-1 px-4 pt-2" contentContainerStyle={{ paddingBottom: 24 }}>
        <Text className="mb-1 text-lg font-bold text-black dark:text-white">{activeSection.title}</Text>

        <SinglePlayAudioButton
          audioUrl={activeSection.audioUrl}
          hasPlayed={!!playedSections[activeIndex]}
          onPlayed={() => setPlayedSections((prev) => ({ ...prev, [activeIndex]: true }))}
        />

        {activeSection.questions.map((question, i) => (
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
        {isLastSection ? (
          <Button fullWidth loading={isSubmitting} onPress={confirmSubmit}>
            Submit Test
          </Button>
        ) : (
          <Button fullWidth onPress={() => setActiveIndex((i) => i + 1)}>
            Next Section
          </Button>
        )}
      </View>
    </Screen>
  );
}
