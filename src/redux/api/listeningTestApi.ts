import { baseApi } from './baseApi';
import { tagTypes } from './tagTypes';
import type { ApiResponse } from '@/types/api';
import type { TestSession } from '@/types/test';
import type { ListeningTest } from '@/types/listening';

interface StartOrGetListeningTestData {
  session: TestSession;
  listeningTest: ListeningTest;
}

interface SubmitListeningTestData {
  rawScore: number;
  totalQuestions: number;
  band: number;
  session: TestSession;
}

const listeningTestApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    startListeningTest: builder.mutation<ApiResponse<StartOrGetListeningTestData>, void>({
      query: () => ({
        url: '/listening-tests/start',
        method: 'POST',
      }),
      invalidatesTags: [tagTypes.ListeningTest, tagTypes.Session],
    }),
    getListeningTest: builder.query<ApiResponse<StartOrGetListeningTestData>, string>({
      query: (sessionId) => ({
        url: `/listening-tests/${sessionId}`,
        method: 'GET',
      }),
      providesTags: [tagTypes.ListeningTest],
    }),
    submitListeningTest: builder.mutation<
      ApiResponse<SubmitListeningTestData>,
      { sessionId: string; answers: { questionId: string; answerText: string }[] }
    >({
      query: ({ sessionId, answers }) => ({
        url: `/listening-tests/${sessionId}/submit`,
        method: 'POST',
        data: { answers },
      }),
      invalidatesTags: [tagTypes.ListeningTest, tagTypes.Session],
    }),
  }),
});

export const {
  useStartListeningTestMutation,
  useGetListeningTestQuery,
  useSubmitListeningTestMutation,
} = listeningTestApi;
