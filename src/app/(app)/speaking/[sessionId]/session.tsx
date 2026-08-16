import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Mic, MicOff, Volume2, VolumeX, CircleCheckBig } from 'lucide-react-native';

import { Screen } from '@/components/ui/Screen';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BandScore } from '@/components/ui/BandScore';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { ChatBubble } from '@/components/test/ChatBubble';
import { useExamTts } from '@/hooks/useExamTts';
import { useSpeechRecorder } from '@/hooks/useSpeechRecorder';
import { cn } from '@/lib/utils';
import {
  useAnalyzeSpeakingTestMutation,
  useChatSpeakingTestMutation,
  useGetSpeakingTestQuery,
  useSubmitSpeakingPart2Mutation,
  useTranscribeSpeakingAudioMutation,
} from '@/redux/api/speakingTestApi';
import type { ConversationMessage, SpeakingAnalyzeResult, SpeakingCriteriaScores } from '@/types/speaking';

type Phase = 'part1' | 'part2-prep' | 'part2-speaking' | 'part2-followup' | 'part3' | 'analyzing' | 'done';

const PREP_SECONDS = 60;
const PART2_SPEAKING_SECONDS = 120;
const PART_TIME_LIMIT_SECONDS = 5 * 60; // safety cap, not the primary way a part ends

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const criteriaLabels: Record<keyof SpeakingCriteriaScores, string> = {
  fluencyCoherence: 'Fluency & Coherence',
  lexicalResource: 'Lexical Resource',
  grammaticalRange: 'Grammatical Range & Accuracy',
  pronunciation: 'Pronunciation*',
};

async function uploadAndTranscribe(
  uri: string,
  transcribe: ReturnType<typeof useTranscribeSpeakingAudioMutation>[0],
  sessionId: string,
) {
  const formData = new FormData();
  // React Native's FormData accepts this {uri,name,type} file shape - it isn't
  // representable in the DOM FormData type RTK Query's generics expect.
  formData.append('audio', { uri, name: 'answer.m4a', type: 'audio/m4a' } as unknown as Blob);
  const res = await transcribe({ sessionId, formData }).unwrap();
  return res.data.text;
}

export default function SpeakingSessionScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const { data } = useGetSpeakingTestQuery(sessionId);
  const [chatSpeakingTest] = useChatSpeakingTestMutation();
  const [submitSpeakingPart2] = useSubmitSpeakingPart2Mutation();
  const [analyzeSpeakingTest] = useAnalyzeSpeakingTestMutation();
  const [transcribeSpeakingAudio] = useTranscribeSpeakingAudioMutation();
  const { isSpeaking, isMuted, speak, toggleMute } = useExamTts();
  const { isRecording, start, stop } = useSpeechRecorder();

  const speakingTest = data?.data?.speakingTest;

  const [phase, setPhase] = useState<Phase>('part1');
  const [part1Conversation, setPart1Conversation] = useState<ConversationMessage[]>([]);
  const [part2FollowUpConversation, setPart2FollowUpConversation] = useState<ConversationMessage[]>([]);
  const [part3Conversation, setPart3Conversation] = useState<ConversationMessage[]>([]);
  const [isAiResponding, setIsAiResponding] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [prepTimeLeft, setPrepTimeLeft] = useState(PREP_SECONDS);
  const [speakTimeLeft, setSpeakTimeLeft] = useState(PART2_SPEAKING_SECONDS);
  const [partTimeLeft, setPartTimeLeft] = useState(PART_TIME_LIMIT_SECONDS);
  const [result, setResult] = useState<SpeakingAnalyzeResult | null>(null);
  const startedRef = useRef({ part1: false, part2Followup: false, part3: false });
  const scrollRef = useRef<ScrollView>(null);

  const handlePart1Answer = async (transcript: string) => {
    if (!transcript.trim()) return;
    const userMessage: ConversationMessage = { role: 'user', content: transcript };
    const conversationForApi = [...part1Conversation, userMessage];
    setPart1Conversation((prev) => [...prev, userMessage]);
    setIsAiResponding(true);
    try {
      const res = await chatSpeakingTest({ sessionId, part: 1, conversation: conversationForApi }).unwrap();
      const aiMessage: ConversationMessage = { role: 'assistant', content: res.data.reply };
      setPart1Conversation((prev) => [...prev, aiMessage]);
      speak(res.data.reply);
      if (res.data.isPartComplete) {
        setTimeout(() => setPhase('part2-prep'), 1500);
      }
    } catch {
      Alert.alert('Something went wrong', 'Please try answering again.');
    } finally {
      setIsAiResponding(false);
    }
  };

  const handlePart2FollowUpAnswer = async (transcript: string) => {
    if (!transcript.trim()) return;
    const userMessage: ConversationMessage = { role: 'user', content: transcript };
    const conversationForApi = [...part2FollowUpConversation, userMessage];
    setPart2FollowUpConversation((prev) => [...prev, userMessage]);
    setIsAiResponding(true);
    try {
      const res = await chatSpeakingTest({ sessionId, part: 2, conversation: conversationForApi }).unwrap();
      const aiMessage: ConversationMessage = { role: 'assistant', content: res.data.reply };
      setPart2FollowUpConversation((prev) => [...prev, aiMessage]);
      speak(res.data.reply);
      if (res.data.isPartComplete) {
        setTimeout(() => setPhase('part3'), 1500);
      }
    } catch {
      Alert.alert('Something went wrong', 'Please try answering again.');
    } finally {
      setIsAiResponding(false);
    }
  };

  const handlePart3Answer = async (transcript: string) => {
    if (!transcript.trim()) return;
    const userMessage: ConversationMessage = { role: 'user', content: transcript };
    const conversationForApi = [...part3Conversation, userMessage];
    setPart3Conversation((prev) => [...prev, userMessage]);
    setIsAiResponding(true);
    try {
      const res = await chatSpeakingTest({ sessionId, part: 3, conversation: conversationForApi }).unwrap();
      const aiMessage: ConversationMessage = { role: 'assistant', content: res.data.reply };
      setPart3Conversation((prev) => [...prev, aiMessage]);
      speak(res.data.reply);
      if (res.data.isPartComplete) {
        setTimeout(() => setPhase('analyzing'), 1500);
      }
    } catch {
      Alert.alert('Something went wrong', 'Please try answering again.');
    } finally {
      setIsAiResponding(false);
    }
  };

  const handleMicPress = async () => {
    if (isAiResponding || isSpeaking || isTranscribing) return;
    if (!isRecording) {
      try {
        await start();
      } catch {
        Alert.alert('Microphone needed', 'Please allow microphone access to answer.');
      }
      return;
    }
    const uri = await stop();
    if (!uri) return;
    setIsTranscribing(true);
    try {
      const transcript = await uploadAndTranscribe(uri, transcribeSpeakingAudio, sessionId);
      if (phase === 'part1') await handlePart1Answer(transcript);
      else if (phase === 'part2-followup') await handlePart2FollowUpAnswer(transcript);
      else if (phase === 'part3') await handlePart3Answer(transcript);
    } catch (err) {
      console.error('Transcription failed:', JSON.stringify(err));
      Alert.alert('Transcription failed', "Couldn't understand that recording. Please try again.");
    } finally {
      setIsTranscribing(false);
    }
  };

  // Kick off Part 1 with the examiner's opening question once the test loads.
  useEffect(() => {
    if (!speakingTest || startedRef.current.part1) return;
    startedRef.current.part1 = true;
    (async () => {
      setIsAiResponding(true);
      try {
        const res = await chatSpeakingTest({ sessionId, part: 1, conversation: [] }).unwrap();
        const aiMessage: ConversationMessage = { role: 'assistant', content: res.data.reply };
        setPart1Conversation([aiMessage]);
        speak(res.data.reply);
      } finally {
        setIsAiResponding(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speakingTest]);

  // Kick off the Part 2 rounding-off follow-up questions once the long turn ends.
  useEffect(() => {
    if (phase !== 'part2-followup' || startedRef.current.part2Followup) return;
    startedRef.current.part2Followup = true;
    (async () => {
      setIsAiResponding(true);
      try {
        const res = await chatSpeakingTest({ sessionId, part: 2, conversation: [] }).unwrap();
        const aiMessage: ConversationMessage = { role: 'assistant', content: res.data.reply };
        setPart2FollowUpConversation([aiMessage]);
        speak(res.data.reply);
      } finally {
        setIsAiResponding(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Kick off Part 3 the same way once we reach it.
  useEffect(() => {
    if (phase !== 'part3' || startedRef.current.part3) return;
    startedRef.current.part3 = true;
    (async () => {
      setIsAiResponding(true);
      try {
        const res = await chatSpeakingTest({ sessionId, part: 3, conversation: [] }).unwrap();
        const aiMessage: ConversationMessage = { role: 'assistant', content: res.data.reply };
        setPart3Conversation([aiMessage]);
        speak(res.data.reply);
      } finally {
        setIsAiResponding(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Part 1 and Part 3 each run ~4-5 minutes in the real test - a safety cap, not the
  // primary way forward (normally a part ends once its questions are exhausted).
  useEffect(() => {
    if (phase !== 'part1' && phase !== 'part3') return;
    setPartTimeLeft(PART_TIME_LIMIT_SECONDS);
    const interval = setInterval(() => {
      setPartTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setPhase((current) => {
            if (current === 'part1') return 'part2-prep';
            if (current === 'part3') return 'analyzing';
            return current;
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase]);

  // Part 2 prep countdown - silent, no mic active.
  useEffect(() => {
    if (phase !== 'part2-prep') return;
    setPrepTimeLeft(PREP_SECONDS);
    const interval = setInterval(() => {
      setPrepTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setPhase('part2-speaking');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase]);

  const finishPart2 = async () => {
    const uri = await stop();
    let transcript = '';
    if (uri) {
      try {
        transcript = await uploadAndTranscribe(uri, transcribeSpeakingAudio, sessionId);
      } catch {
        // Fall through with an empty transcript rather than blocking progress -
        // the candidate already delivered the long turn; a failed upload
        // shouldn't strand them mid-test.
      }
    }
    try {
      await submitSpeakingPart2({ sessionId, transcript }).unwrap();
    } catch {
      // same reasoning - don't block the flow on a logging call failing
    }
    setPhase('part2-followup');
  };
  const finishPart2Ref = useRef(finishPart2);
  useEffect(() => {
    finishPart2Ref.current = finishPart2;
  });

  // Part 2 long turn - record automatically for up to 2 minutes.
  useEffect(() => {
    if (phase !== 'part2-speaking') return;
    setSpeakTimeLeft(PART2_SPEAKING_SECONDS);
    start().catch(() => Alert.alert('Microphone needed', 'Please allow microphone access to answer.'));
    const interval = setInterval(() => {
      setSpeakTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          finishPart2Ref.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Grade the full test once Part 3 wraps up.
  useEffect(() => {
    if (phase !== 'analyzing') return;
    (async () => {
      try {
        const res = await analyzeSpeakingTest(sessionId).unwrap();
        setResult(res.data);
        setPhase('done');
      } catch {
        Alert.alert('Grading failed', 'Failed to analyze your speaking test. Please try again.');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [part1Conversation, part2FollowUpConversation, part3Conversation]);

  if (!speakingTest) {
    return (
      <Screen className="items-center justify-center">
        <ActivityIndicator color="#06D6A0" />
      </Screen>
    );
  }

  if (phase === 'done' && result) {
    return (
      <Screen scroll className="items-center px-6 pt-8">
        <View className="mb-4 h-14 w-14 items-center justify-center rounded-full bg-teal/10">
          <CircleCheckBig size={26} color="#06D6A0" strokeWidth={2} />
        </View>
        <Text className="mb-8 text-center text-lg text-black/60 dark:text-white/60">Speaking test complete</Text>

        <BandScore score={result.band} label="Estimated band score" />

        <Card className="my-8 w-full">
          {(Object.keys(criteriaLabels) as (keyof SpeakingCriteriaScores)[]).map((key) => (
            <View key={key} className="mb-3">
              <View className="mb-1 flex-row items-center justify-between">
                <Text className="text-sm text-black/70 dark:text-white/70">{criteriaLabels[key]}</Text>
                <Text className="text-sm font-semibold text-black dark:text-white">
                  {result.criteriaScores[key].toFixed(1)}
                </Text>
              </View>
              <ProgressBar value={result.criteriaScores[key]} max={9} />
            </View>
          ))}
          <Text className="mb-3 text-xs text-black/40 dark:text-white/40">
            *Pronunciation is estimated from the transcript only, not from audio analysis.
          </Text>
          <Text className="text-sm leading-5 text-black/70 dark:text-white/70">{result.feedback}</Text>
        </Card>

        <Button fullWidth onPress={() => router.replace('/(app)/(tabs)')}>
          Back to Home
        </Button>
      </Screen>
    );
  }

  if (phase === 'analyzing') {
    return (
      <Screen className="items-center justify-center gap-4">
        <ActivityIndicator color="#06D6A0" />
        <Text className="text-black/60 dark:text-white/60">Analyzing your speaking test…</Text>
      </Screen>
    );
  }

  if (phase === 'part2-prep' || phase === 'part2-speaking') {
    return (
      <Screen scroll className="items-center px-6 pt-10">
        <View className="mb-3 self-center rounded-full bg-teal/10 px-3 py-1">
          <Text className="text-xs font-semibold text-navy dark:text-teal">Part 2: Individual Long Turn</Text>
        </View>
        <Text className="mb-6 text-center text-2xl font-bold text-black dark:text-white">
          {speakingTest.cueCardTopic}
        </Text>

        <Card className="mb-8 w-full">
          <Text className="mb-2 text-sm font-medium text-black/60 dark:text-white/60">You should say:</Text>
          {speakingTest.cueCardBullets.map((bullet, i) => (
            <Text key={i} className="mb-1 text-sm text-black dark:text-white">
              • {bullet}
            </Text>
          ))}
        </Card>

        {phase === 'part2-prep' ? (
          <View className="items-center">
            <Text className="mb-2 text-sm text-black/60 dark:text-white/60">
              Preparation time — no need to speak yet
            </Text>
            <Text className="text-5xl font-extrabold text-navy dark:text-teal">{formatTime(prepTimeLeft)}</Text>
          </View>
        ) : (
          <View className="items-center gap-4">
            <View className="flex-row items-center gap-2">
              <Mic size={20} color="#EF4444" />
              <Text className="font-medium text-danger">Recording your answer…</Text>
            </View>
            <Text className="text-5xl font-extrabold text-navy dark:text-teal">{formatTime(speakTimeLeft)}</Text>
            <Button variant="secondary" onPress={() => finishPart2Ref.current()}>
              Finish Early
            </Button>
          </View>
        )}
      </Screen>
    );
  }

  const conversation =
    phase === 'part1' ? part1Conversation : phase === 'part2-followup' ? part2FollowUpConversation : part3Conversation;
  const phaseLabel =
    phase === 'part1'
      ? 'Part 1: Introduction and Interview'
      : phase === 'part2-followup'
        ? 'Part 2: Rounding-off Questions'
        : 'Part 3: Two-Way Discussion';

  return (
    <Screen className="pt-2">
      <View className="flex-row items-center justify-between border-b border-black/5 px-4 pb-3 dark:border-white/5">
        <View>
          <Text className="text-base font-bold text-black dark:text-white">IELTS Speaking Test</Text>
          <View className="mt-1 self-start rounded-full bg-teal/10 px-2.5 py-0.5">
            <Text className="text-xs font-semibold text-navy dark:text-teal">{phaseLabel}</Text>
          </View>
        </View>
        <Pressable onPress={toggleMute} hitSlop={8}>
          {isMuted ? <VolumeX size={20} color="#60646C" /> : <Volume2 size={20} color="#06D6A0" />}
        </Pressable>
      </View>

      <ScrollView ref={scrollRef} className="flex-1 px-4 pt-4" contentContainerStyle={{ paddingBottom: 16 }}>
        {conversation.map((message, index) => (
          <ChatBubble key={index} message={message} />
        ))}
        {isAiResponding ? <ChatBubble message={{ role: 'assistant', content: '' }} isLoading /> : null}
      </ScrollView>

      <View className="items-center border-t border-black/5 px-4 py-6 dark:border-white/5">
        <Pressable
          onPress={handleMicPress}
          disabled={isAiResponding || isSpeaking || isTranscribing}
          className={cn(
            'flex-row items-center gap-2 rounded-full px-6 py-4',
            isRecording ? 'bg-danger' : 'bg-teal',
            (isAiResponding || isSpeaking || isTranscribing) && 'opacity-50',
          )}
        >
          {isTranscribing ? (
            <ActivityIndicator color="#ffffff" />
          ) : isRecording ? (
            <MicOff size={20} color="#ffffff" />
          ) : (
            <Mic size={20} color="#0A0F1E" />
          )}
          <Text className={cn('font-semibold', isRecording ? 'text-white' : 'text-ink')}>
            {isTranscribing ? 'Transcribing…' : isRecording ? 'Stop & Send' : 'Tap to Speak'}
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}
