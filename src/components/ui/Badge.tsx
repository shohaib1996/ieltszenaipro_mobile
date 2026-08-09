import { Text, View } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/** Amber/teal status pills — always a fill with dark text, per contrast rule 5. */
const badgeVariants = cva('flex-row items-center self-start rounded-full px-3 py-1', {
  variants: {
    variant: {
      success: 'bg-teal',
      warning: 'bg-amber',
      danger: 'bg-danger',
      neutral: 'bg-black/10 dark:bg-white/10',
    },
  },
  defaultVariants: { variant: 'neutral' },
});

const textVariants = cva('text-xs font-semibold', {
  variants: {
    variant: {
      success: 'text-ink',
      warning: 'text-ink',
      danger: 'text-white',
      neutral: 'text-black dark:text-white',
    },
  },
  defaultVariants: { variant: 'neutral' },
});

export interface BadgeProps extends VariantProps<typeof badgeVariants> {
  children: string;
  className?: string;
}

export function Badge({ children, variant, className }: BadgeProps) {
  return (
    <View className={cn(badgeVariants({ variant }), className)}>
      <Text className={textVariants({ variant })}>{children}</Text>
    </View>
  );
}
