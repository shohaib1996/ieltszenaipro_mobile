import { createApi, type BaseQueryFn } from '@reduxjs/toolkit/query/react';
import { AxiosError, type Method } from 'axios';
import axiosInstance from '@/lib/axiosInstance';
import { tagTypesList } from './tagTypes';

// We can't import RootState from store.ts without creating a circular dependency,
// so we define the shape of the state slice we need here — same pattern as the web app.
interface AuthEnabledState {
  auth: {
    token: string | null;
  };
}

type AxiosArgs = {
  url: string;
  method: Method;
  data?: unknown;
  params?: unknown;
};

const axiosBaseQuery =
  ({ baseUrl }: { baseUrl?: string } = { baseUrl: '' }): BaseQueryFn<AxiosArgs, unknown, unknown> =>
  async ({ url, method, data, params }, api) => {
    try {
      const token = (api.getState() as AuthEnabledState).auth.token;

      const result = await axiosInstance({
        url: baseUrl + url,
        method,
        data,
        params,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return { data: result.data };
    } catch (axiosError) {
      const err = axiosError as AxiosError;
      return {
        error: {
          status: err.response?.status,
          data: err.response?.data || err.message,
        },
      };
    }
  };

export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: axiosBaseQuery(),
  endpoints: () => ({}),
  tagTypes: tagTypesList,
});
