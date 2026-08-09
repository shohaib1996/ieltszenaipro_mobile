import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type ThemePreference = 'light' | 'dark' | 'system';

export interface SettingsState {
  themePreference: ThemePreference;
}

// Dark is the default/primary experience per the brand design system, regardless
// of device system setting, until the student picks otherwise in Settings.
const initialState: SettingsState = {
  themePreference: 'dark',
};

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setThemePreference: (state, action: PayloadAction<ThemePreference>) => {
      state.themePreference = action.payload;
    },
  },
});

export const { setThemePreference } = settingsSlice.actions;
export default settingsSlice.reducer;
