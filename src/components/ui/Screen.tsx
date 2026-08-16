import { type ReactNode } from 'react';
import { View, ScrollView, type ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cn } from '@/lib/utils';

type ScreenProps = ViewProps & {
  children: ReactNode;
  scroll?: boolean;
  className?: string;
  /**
   * Classes for the ScrollView's content container (e.g. `items-center`, `justify-center`).
   * React Native forbids `alignItems`/`justifyContent` on a ScrollView's own style — they
   * must be applied here instead. Ignored when `scroll` is false.
   */
  contentContainerClassName?: string;
};

/**
 * Root wrapper for every screen: safe-area + brand background (white in light mode,
 * near-black `ink` in dark mode — dark is the default/primary experience per the design
 * system, so screens should look intentional, not "inverted," in either mode).
 */
export function Screen({
  children,
  scroll = false,
  className,
  contentContainerClassName,
  ...rest
}: ScreenProps) {
  const Container = scroll ? ScrollView : View;
  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-ink" edges={['top', 'bottom']}>
      <Container
        className={cn('flex-1', !scroll && className)}
        {...(scroll
          ? { contentContainerClassName: cn('flex-grow', className, contentContainerClassName) }
          : {})}
        {...rest}
      >
        {children}
      </Container>
    </SafeAreaView>
  );
}
