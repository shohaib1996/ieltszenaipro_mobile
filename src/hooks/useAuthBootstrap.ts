import { useEffect } from 'react';
import { useAppDispatch } from '@/redux/hooks';
import { bootstrapFinished, login } from '@/redux/features/authSlice';
import { secureStorage } from '@/lib/secureStorage';

/** Reads a persisted session from SecureStore once on cold start. */
export function useAuthBootstrap() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const session = await secureStorage.loadSession();
      if (cancelled) return;
      if (session) {
        dispatch(login(session));
      }
      dispatch(bootstrapFinished());
    })();

    return () => {
      cancelled = true;
    };
  }, [dispatch]);
}
