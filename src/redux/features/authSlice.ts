import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface IUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
}

export interface AuthState {
  user: IUser | null;
  token: string | null;
  isBootstrapping: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  // true until we've checked SecureStore for a persisted session on cold start
  isBootstrapping: true,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ user: IUser; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
    },
    bootstrapFinished: (state) => {
      state.isBootstrapping = false;
    },
  },
});

export const { login, logout, bootstrapFinished } = authSlice.actions;
export default authSlice.reducer;
