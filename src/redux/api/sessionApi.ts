import { baseApi } from './baseApi';
import { tagTypes } from './tagTypes';
import type { PaginatedApiResponse, ApiResponse } from '@/types/api';
import type { TestSession } from '@/types/test';

interface GetAllSessionsArgs {
  userId?: string;
  page?: number;
  limit?: number;
  type?: string;
}

const sessionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllSessions: builder.query<PaginatedApiResponse<TestSession[]>, GetAllSessionsArgs>({
      query: (arg) => ({
        url: '/sessions',
        method: 'GET',
        params: arg,
      }),
      providesTags: [tagTypes.Session],
    }),
    getSingleSession: builder.query<ApiResponse<TestSession>, string>({
      query: (id) => ({
        url: `/sessions/${id}`,
        method: 'GET',
      }),
      providesTags: [tagTypes.Session],
    }),
  }),
});

export const { useGetAllSessionsQuery, useGetSingleSessionQuery } = sessionApi;
