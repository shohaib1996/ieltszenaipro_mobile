import { useEffect, useRef, useState } from 'react';

/** Ticks down to a fixed deadline (ms epoch), independent of re-renders/app resume. */
export function useCountdown(deadline: number, onExpire?: () => void) {
  const [remainingMs, setRemainingMs] = useState(() => Math.max(0, deadline - Date.now()));
  const expiredRef = useRef(false);

  useEffect(() => {
    expiredRef.current = false;
    const tick = () => {
      const remaining = Math.max(0, deadline - Date.now());
      setRemainingMs(remaining);
      if (remaining <= 0 && !expiredRef.current) {
        expiredRef.current = true;
        onExpire?.();
      }
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deadline]);

  const totalSeconds = Math.floor(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const label = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return { remainingMs, label, isExpired: remainingMs <= 0 };
}
