import { useEffect } from 'react';
import { View, type ViewProps } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { cn } from '@/lib/utils';

/** Pulsing placeholder block for loading states — mirror the real content's shape/size
 * with one of these instead of reaching for a spinner, so nothing jumps when data arrives.
 *
 * The shape/size/color live on a plain `View` (NativeWind styles those reliably); the
 * outer `Animated.View` only ever gets a bare `style={{ opacity }}`, never a `className` —
 * Reanimated's own style-extraction machinery doesn't play well with NativeWind's
 * className-to-style interop, so combining them on one node silently drops the styling. */
export function Skeleton({ className, ...rest }: ViewProps & { className?: string }) {
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: 750, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View style={animatedStyle}>
      <View className={cn('rounded-lg bg-black/10 dark:bg-white/10', className)} {...rest} />
    </Animated.View>
  );
}
