import { baseApi } from './baseApi';
import { tagTypes } from './tagTypes';
import type { ApiResponse } from '@/types/api';
import type { TestAnswer } from '@/types/answer';

interface GetAllAnswersArgs {
  sessionId?: string;
  questionId?: string;
}

const answerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllAnswers: builder.query<ApiResponse<TestAnswer[]>, GetAllAnswersArgs>({
      query: (args) => ({
        url: '/answers',
        method: 'GET',
        params: args,
      }),
      providesTags: [tagTypes.Answer],
    }),
  }),
});

export const { useGetAllAnswersQuery } = answerApi;
