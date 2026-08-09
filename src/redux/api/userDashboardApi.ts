import { baseApi } from './baseApi';
import { tagTypes } from './tagTypes';
import type { ApiResponse } from '@/types/api';
import type { DashboardData } from '@/types/dashboard';

const userDashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUserDashboardData: builder.query<ApiResponse<DashboardData>, void>({
      query: () => ({
        url: '/dashboard/user',
        method: 'GET',
      }),
      providesTags: [tagTypes.UserDashboard],
    }),
  }),
});

export const { useGetUserDashboardDataQuery } = userDashboardApi;
