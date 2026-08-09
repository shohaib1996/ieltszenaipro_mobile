import * as SecureStore from 'expo-secure-store';
import type { IUser } from '@/redux/features/authSlice';

const TOKEN_KEY = 'ieltszen_token';
const USER_KEY = 'ieltszen_user';

/**
 * A JWT is a credential, not app state — it lives in Keychain/Keystore via
 * expo-secure-store, deliberately kept out of redux-persist/AsyncStorage.
 */
export const secureStorage = {
  async saveSession(token: string, user: IUser) {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
  },
  async loadSession(): Promise<{ token: string; user: IUser } | null> {
    const [token, userRaw] = await Promise.all([
      SecureStore.getItemAsync(TOKEN_KEY),
      SecureStore.getItemAsync(USER_KEY),
    ]);
    if (!token || !userRaw) return null;
    try {
      return { token, user: JSON.parse(userRaw) as IUser };
    } catch {
      return null;
    }
  },
  async clearSession() {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
  },
};
