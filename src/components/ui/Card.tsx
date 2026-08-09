import { type ReactNode } from 'react';
import { View, type ViewProps } from 'react-native';
import { cn } from '@/lib/utils';

type CardProps = ViewProps & { children: ReactNode; className?: string };

export function Card({ children, className, ...rest }: CardProps) {
  return (
    <View
      className={cn(
        'rounded-card border border-black/5 bg-white p-4 shadow-sm dark:border-white/5 dark:bg-navy',
        className,
      )}
      {...rest}
    >
      {children}
    </View>
  );
}
