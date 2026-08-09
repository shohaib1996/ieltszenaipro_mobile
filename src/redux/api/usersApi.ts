import { baseApi } from './baseApi';
import { tagTypes } from './tagTypes';
import type { ApiResponse } from '@/types/api';
import type { IUser } from '@/redux/features/authSlice';

interface LoginResponseData {
  user: IUser;
  accessToken: string;
}

const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    registerUser: builder.mutation<
      ApiResponse<{ user: IUser }>,
      { name: string; email: string; password: string }
    >({
      query: (data) => ({
        url: '/users/register',
        method: 'POST',
        data,
      }),
      invalidatesTags: [tagTypes.Users],
    }),
    loginUser: builder.mutation<ApiResponse<LoginResponseData>, { email: string; password: string }>({
      query: (data) => ({
        url: '/users/login',
        method: 'POST',
        data,
      }),
      invalidatesTags: [tagTypes.Users, tagTypes.UserDashboard],
    }),
    getProfile: builder.query<ApiResponse<IUser>, void>({
      query: () => ({
        url: '/users/profile',
        method: 'GET',
      }),
      providesTags: [tagTypes.Users],
    }),
    updateProfile: builder.mutation<ApiResponse<IUser>, Partial<Pick<IUser, 'name' | 'avatarUrl'>>>({
      query: (data) => ({
        url: '/users/profile',
        method: 'PATCH',
        data,
      }),
      invalidatesTags: [tagTypes.Users],
    }),
    resetPassword: builder.mutation<ApiResponse<null>, { oldPassword: string; newPassword: string }>({
      query: (data) => ({
        url: '/users/reset-password',
        method: 'POST',
        data,
      }),
      invalidatesTags: [tagTypes.Users],
    }),
  }),
});

export const {
  useRegisterUserMutation,
  useLoginUserMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useResetPasswordMutation,
} = usersApi;
