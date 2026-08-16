import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { format } from 'date-fns';
import { ArrowLeft, BookOpenCheck, CheckCircle, XCircle } from 'lucide-react-native';

import { BandScore } from '@/components/ui/BandScore';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Screen } from '@/components/ui/Screen';
import { getSkillMeta } from '@/lib/skills';
import { useGetAllAnswersQuery } from '@/redux/api/answerApi';
import { useGetListeningTestQuery } from '@/redux/api/listeningTestApi';
import { useGetReadingTestQuery } from '@/redux/api/readingTestApi';
import { useGetSingleSessionQuery } from '@/redux/api/sessionApi';
import { useGetSpeakingTestQuery } from '@/redux/api/speakingTestApi';
import { useGetWritingTestQuery } from '@/redux/api/writingTestApi';
import type { TestAnswer } from '@/types/answer';
import type { TestQuestion } from '@/types/test';
import type { SpeakingCriteriaScores } from '@/types/speaking';
import type { WritingCriteriaScores, WritingTaskPayload } from '@/types/writing';

const CRITERIA_LABELS: Record<string, string> = {
  taskScore: 'Task response',
  coherenceCohesion: 'Coherence',
  fluencyCoherence: 'Fluency',
  lexicalResource: 'Lexical',
  grammaticalRange: 'Grammar',
  pronunciation: 'Pronunciation',
};

const formatDuration = (startedAt?: string, endedAt?: string | null) => {
  if (!startedAt || !endedAt) return 'N/A';
  const minutes = Math.floor((new Date(endedAt).getTime() - new Date(startedAt).getTime()) / 60000);
  if (minutes < 1) return '< 1m';
  if (minutes < 60) return `${minutes}m`;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
};

const normalizeFeedback = (feedback: unknown): string | null => {
  if (!feedback) return null;
  if (typeof feedback === 'string') {
    try {
      const parsed = JSON.parse(feedback) as { feedback?: unknown };
      return typeof parsed.feedback === 'string' ? parsed.feedback : feedback;
    } catch {
      return feedback;
    }
  }
  if (typeof feedback === 'object' && 'feedback' in feedback) {
    const text = (feedback as { feedback?: unknown }).feedback;
    return typeof text === 'string' ? text : null;
  }
  return null;
};

const speakingCriteria = (feedback: unknown): SpeakingCriteriaScores | null => {
  const source = typeof feedback === 'string' ? safeJson(feedback) : feedback;
  const criteria = (source as { criteriaScores?: SpeakingCriteriaScores } | null)?.criteriaScores;
  return criteria ?? null;
};

const safeJson = (value: string): unknown => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

function CriteriaGrid({ scores }: { scores?: Record<string, number> | WritingCriteriaScores | SpeakingCriteriaScores | null }) {
  if (!scores) return null;

  return (
    <View className="mt-3 gap-3">
      {Object.entries(scores).map(([key, value]) => (
        <View key={key}>
          <View className="mb-1 flex-row items-center justify-between">
            <Text className="text-xs font-semibold text-black/60 dark:text-white/60">
              {CRITERIA_LABELS[key] ?? key}
            </Text>
            <Text className="text-xs font-bold text-black dark:text-white">{Number(value).toFixed(1)}</Text>
          </View>
          <ProgressBar value={Number(value)} max={9} />
        </View>
      ))}
    </View>
  );
}

function AnswerReview({ question, answer }: { question: TestQuestion; answer?: TestAnswer }) {
  const correct = !!answer?.isCorrect;
  const Icon = correct ? CheckCircle : XCircle;

  return (
    <Card className="gap-2">
      <Text className="text-sm font-semibold text-black dark:text-white">{question.text}</Text>
      <View className="flex-row items-center gap-2">
        <Icon size={16} color={correct ? '#06D6A0' : '#EF4444'} strokeWidth={2} />
        <Text className="flex-1 text-xs text-black/60 dark:text-white/60">
          Your answer: <Text className="font-semibold text-black dark:text-white">{answer?.answerText || 'No answer'}</Text>
        </Text>
      </View>
      {!correct ? (
        <Text className="text-xs text-black/60 dark:text-white/60">
          Correct answer: <Text className="font-semibold text-teal">{question.correctAnswer || 'N/A'}</Text>
        </Text>
      ) : null}
    </Card>
  );
}

function WritingTaskReview({ task, label }: { task?: WritingTaskPayload; label: string }) {
  if (!task) return null;

  return (
    <Card className="gap-3">
      <View className="flex-row items-start justify-between gap-3">
        <Text className="flex-1 text-base font-bold text-black dark:text-white">{label}</Text>
        <Text className="text-base font-extrabold text-navy dark:text-teal">
          {task.score != null ? task.score.toFixed(1) : 'N/A'}
        </Text>
      </View>
      <Text className="text-sm leading-5 text-black/70 dark:text-white/70">{task.promptText}</Text>
      <Card className="bg-black/5 shadow-none dark:bg-white/10">
        <Text className="text-xs font-semibold text-black/60 dark:text-white/60">Submitted response</Text>
        <Text className="mt-2 text-sm leading-5 text-black dark:text-white">
          {task.submittedText || 'No response submitted.'}
        </Text>
      </Card>
      <Text className="text-xs text-black/50 dark:text-white/50">{task.wordCount ?? 0} words</Text>
      <CriteriaGrid scores={task.criteriaScores} />
      {task.feedback ? <Text className="text-sm leading-5 text-black/70 dark:text-white/70">{task.feedback}</Text> : null}
    </Card>
  );
}

export default function ProgressDetailScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const { data: sessionData, isLoading: isSessionLoading } = useGetSingleSessionQuery(sessionId, { skip: !sessionId });
  const session = sessionData?.data;
  const sessionType = session?.type;
  const isReading = sessionType === 'IELTS_READING';
  const isListening = sessionType === 'IELTS_LISTENING';
  const isWriting = sessionType === 'IELTS_WRITING';
  const isSpeaking = sessionType === 'IELTS_SPEAKING';

  const { data: readingData } = useGetReadingTestQuery(sessionId, { skip: !sessionId || !isReading });
  const { data: listeningData } = useGetListeningTestQuery(sessionId, { skip: !sessionId || !isListening });
  const { data: writingData } = useGetWritingTestQuery(sessionId, { skip: !sessionId || !isWriting });
  const { data: speakingData } = useGetSpeakingTestQuery(sessionId, { skip: !sessionId || !isSpeaking });
  const { data: answersData } = useGetAllAnswersQuery(
    { sessionId },
    { skip: !sessionId || (!isReading && !isListening) },
  );

  if (isSessionLoading || !session) {
    return (
      <Screen className="items-center justify-center px-6">
        <ActivityIndicator color="#06D6A0" />
      </Screen>
    );
  }

  const meta = getSkillMeta(session.type) ?? { label: session.type, icon: BookOpenCheck };
  const Icon = meta.icon;
  const answersByQuestion = (answersData?.data ?? []).reduce<Record<string, TestAnswer>>((acc, answer) => {
    acc[answer.questionId] = answer;
    return acc;
  }, {});
  const feedbackText = normalizeFeedback(session.feedback);
  const conversation = session.aiChatConversations?.[0]?.conversation ?? [];
  const speakingTest = speakingData?.data?.speakingTest;

  return (
    <Screen scroll className="px-6 pb-28 pt-4">
      <Pressable onPress={() => router.back()} className="mb-4 flex-row items-center gap-2 self-start">
        <ArrowLeft size={18} color="#06D6A0" strokeWidth={2} />
        <Text className="text-sm font-semibold text-navy dark:text-teal">Progress</Text>
      </Pressable>

      <View className="mb-5 flex-row items-center gap-3">
        <View className="h-11 w-11 items-center justify-center rounded-full bg-teal/10">
          <Icon size={20} color="#06D6A0" strokeWidth={2} />
        </View>
        <View className="flex-1">
          <Text className="text-2xl font-extrabold text-black dark:text-white">{meta.label} review</Text>
          <Text className="text-sm text-black/50 dark:text-white/50">
            {format(new Date(session.startedAt), 'MMM d, yyyy')} - {formatDuration(session.startedAt, session.endedAt)}
          </Text>
        </View>
      </View>

      <BandScore score={session.score ?? 0} label="Band score" />

      {feedbackText ? (
        <Card className="mt-5">
          <Text className="mb-2 text-base font-bold text-black dark:text-white">AI feedback</Text>
          <Text className="text-sm leading-5 text-black/70 dark:text-white/70">{feedbackText}</Text>
        </Card>
      ) : null}

      {isSpeaking ? (
        <View className="mt-5 gap-4">
          <Card>
            <Text className="text-base font-bold text-black dark:text-white">Criteria</Text>
            <CriteriaGrid scores={speakingCriteria(session.feedback)} />
            <Text className="mt-3 text-xs text-black/50 dark:text-white/50">
              Pronunciation is estimated from the transcript only.
            </Text>
          </Card>

          {speakingTest ? (
            <Card>
              <Text className="text-base font-bold text-black dark:text-white">Cue card</Text>
              <Text className="mt-2 text-sm font-semibold text-black dark:text-white">{speakingTest.cueCardTopic}</Text>
              {speakingTest.cueCardBullets.map((bullet, index) => (
                <Text key={index} className="mt-1 text-sm text-black/70 dark:text-white/70">
                  - {bullet}
                </Text>
              ))}
            </Card>
          ) : null}

          <Card>
            <Text className="mb-3 text-base font-bold text-black dark:text-white">Transcript</Text>
            {conversation.length === 0 ? (
              <Text className="text-sm text-black/60 dark:text-white/60">No transcript was saved for this session.</Text>
            ) : (
              <View className="gap-3">
                {conversation.map((message, index) => (
                  <View
                    key={`${message.role}-${index}`}
                    className={message.role === 'assistant' ? 'self-start rounded-card bg-black/5 p-3 dark:bg-white/10' : 'self-end rounded-card bg-teal/15 p-3'}
                  >
                    <Text className="mb-1 text-xs font-semibold text-black/50 dark:text-white/50">
                      {message.role === 'assistant' ? 'Examiner' : 'You'}
                    </Text>
                    <Text className="text-sm leading-5 text-black dark:text-white">{message.content}</Text>
                  </View>
                ))}
              </View>
            )}
          </Card>
        </View>
      ) : null}

      {isWriting ? (
        <View className="mt-5 gap-4">
          <WritingTaskReview task={writingData?.data?.task1} label="Task 1" />
          <WritingTaskReview task={writingData?.data?.task2} label="Task 2" />
        </View>
      ) : null}

      {isReading ? (
        <View className="mt-5 gap-4">
          {readingData?.data?.readingTest.passages.map((passage) => (
            <View key={passage.id} className="gap-3">
              <Text className="text-base font-bold text-black dark:text-white">
                Passage {passage.order}: {passage.title}
              </Text>
              {passage.questions.map((question) => (
                <AnswerReview key={question.id} question={question} answer={answersByQuestion[question.id]} />
              ))}
            </View>
          ))}
        </View>
      ) : null}

      {isListening ? (
        <View className="mt-5 gap-4">
          {listeningData?.data?.listeningTest.sections.map((section) => (
            <View key={section.id} className="gap-3">
              <Text className="text-base font-bold text-black dark:text-white">
                Section {section.order}: {section.title}
              </Text>
              {section.questions.map((question) => (
                <AnswerReview key={question.id} question={question} answer={answersByQuestion[question.id]} />
              ))}
            </View>
          ))}
        </View>
      ) : null}
    </Screen>
  );
}
