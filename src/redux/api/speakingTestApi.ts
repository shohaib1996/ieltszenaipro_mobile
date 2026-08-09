import { baseApi } from './baseApi';
import { tagTypes } from './tagTypes';
import type { ApiResponse } from '@/types/api';
import type { TestSession } from '@/types/test';
import type { ConversationMessage, SpeakingAnalyzeResult, SpeakingTest } from '@/types/speaking';

interface StartOrGetSpeakingTestData {
  session: TestSession;
  speakingTest: SpeakingTest;
}

interface ChatReplyData {
  reply: string;
  isPartComplete: boolean;
}

const speakingTestApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    startSpeakingTest: builder.mutation<ApiResponse<StartOrGetSpeakingTestData>, void>({
      query: () => ({
        url: '/speaking-tests/start',
        method: 'POST',
      }),
      invalidatesTags: [tagTypes.SpeakingTest, tagTypes.Session],
    }),
    getSpeakingTest: builder.query<ApiResponse<StartOrGetSpeakingTestData>, string>({
      query: (sessionId) => ({
        url: `/speaking-tests/${sessionId}`,
        method: 'GET',
      }),
      providesTags: [tagTypes.SpeakingTest],
    }),
    chatSpeakingTest: builder.mutation<
      ApiResponse<ChatReplyData>,
      { sessionId: string; part: 1 | 2 | 3; conversation: ConversationMessage[] }
    >({
      query: ({ sessionId, part, conversation }) => ({
        url: `/speaking-tests/${sessionId}/chat`,
        method: 'POST',
        data: { part, conversation },
      }),
    }),
    submitSpeakingPart2: builder.mutation<ApiResponse<{ success: boolean }>, { sessionId: string; transcript: string }>({
      query: ({ sessionId, transcript }) => ({
        url: `/speaking-tests/${sessionId}/part2`,
        method: 'POST',
        data: { transcript },
      }),
    }),
    analyzeSpeakingTest: builder.mutation<ApiResponse<SpeakingAnalyzeResult & { session: TestSession }>, string>({
      query: (sessionId) => ({
        url: `/speaking-tests/${sessionId}/analyze`,
        method: 'POST',
      }),
      invalidatesTags: [tagTypes.SpeakingTest, tagTypes.Session],
    }),
    transcribeSpeakingAudio: builder.mutation<
      ApiResponse<{ text: string }>,
      { sessionId: string; formData: FormData }
    >({
      query: ({ sessionId, formData }) => ({
        url: `/speaking-tests/${sessionId}/transcribe`,
        method: 'POST',
        data: formData,
      }),
    }),
  }),
});

export const {
  useStartSpeakingTestMutation,
  useGetSpeakingTestQuery,
  useChatSpeakingTestMutation,
  useSubmitSpeakingPart2Mutation,
  useAnalyzeSpeakingTestMutation,
  useTranscribeSpeakingAudioMutation,
} = speakingTestApi;
