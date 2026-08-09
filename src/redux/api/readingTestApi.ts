import { baseApi } from './baseApi';
import { tagTypes } from './tagTypes';
import type { ApiResponse } from '@/types/api';
import type { ReadingTest, TestSession } from '@/types/test';

interface StartOrGetReadingTestData {
  session: TestSession;
  readingTest: ReadingTest;
}

interface SubmitReadingTestData {
  rawScore: number;
  totalQuestions: number;
  band: number;
  session: TestSession;
}

const readingTestApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    startReadingTest: builder.mutation<ApiResponse<StartOrGetReadingTestData>, void>({
      query: () => ({
        url: '/reading-tests/start',
        method: 'POST',
      }),
      invalidatesTags: [tagTypes.ReadingTest, tagTypes.Session],
    }),
    getReadingTest: builder.query<ApiResponse<StartOrGetReadingTestData>, string>({
      query: (sessionId) => ({
        url: `/reading-tests/${sessionId}`,
        method: 'GET',
      }),
      providesTags: [tagTypes.ReadingTest],
    }),
    submitReadingTest: builder.mutation<
      ApiResponse<SubmitReadingTestData>,
      { sessionId: string; answers: { questionId: string; answerText: string }[] }
    >({
      query: ({ sessionId, answers }) => ({
        url: `/reading-tests/${sessionId}/submit`,
        method: 'POST',
        data: { answers },
      }),
      invalidatesTags: [tagTypes.ReadingTest, tagTypes.Session],
    }),
  }),
});

export const {
  useStartReadingTestMutation,
  useGetReadingTestQuery,
  useSubmitReadingTestMutation,
} = readingTestApi;
