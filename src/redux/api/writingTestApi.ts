import { baseApi } from './baseApi';
import { tagTypes } from './tagTypes';
import type { ApiResponse } from '@/types/api';
import type { TestSession } from '@/types/test';
import type { WritingGradeResult, WritingTaskPayload } from '@/types/writing';

interface StartOrGetWritingTestData {
  session: TestSession;
  task1: WritingTaskPayload;
  task2: WritingTaskPayload;
}

interface SubmitWritingTestData {
  task1: WritingGradeResult;
  task2: WritingGradeResult;
  overallBand: number;
  session: TestSession;
}

const writingTestApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    startWritingTest: builder.mutation<ApiResponse<StartOrGetWritingTestData>, void>({
      query: () => ({
        url: '/writing-tests/start',
        method: 'POST',
      }),
      invalidatesTags: [tagTypes.WritingTest, tagTypes.Session],
    }),
    getWritingTest: builder.query<ApiResponse<StartOrGetWritingTestData>, string>({
      query: (sessionId) => ({
        url: `/writing-tests/${sessionId}`,
        method: 'GET',
      }),
      providesTags: [tagTypes.WritingTest],
    }),
    submitWritingTest: builder.mutation<
      ApiResponse<SubmitWritingTestData>,
      { sessionId: string; task1Text: string; task2Text: string }
    >({
      query: ({ sessionId, task1Text, task2Text }) => ({
        url: `/writing-tests/${sessionId}/submit`,
        method: 'POST',
        data: { task1Text, task2Text },
      }),
      invalidatesTags: [tagTypes.WritingTest, tagTypes.Session],
    }),
  }),
});

export const {
  useStartWritingTestMutation,
  useGetWritingTestQuery,
  useSubmitWritingTestMutation,
} = writingTestApi;
