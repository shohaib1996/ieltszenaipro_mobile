import { forwardRef } from 'react';
import { Pressable, Text, ActivityIndicator, type PressableProps } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Contrast rules from mobileappdesignprompt.txt, encoded so they can't be misused:
 * - primary: teal fill + near-black text in BOTH themes (rule 4) — never white-on-teal.
 * - secondary/ghost: teal is only safe as TEXT on a dark background (rule 1/3). In light
 *   mode these fall back to navy text/border, which is dark enough to pass on white.
 */
const buttonVariants = cva('flex-row items-center justify-center rounded-card px-5 py-3.5 active:opacity-80', {
  variants: {
    variant: {
      primary: 'bg-teal',
      secondary: 'border border-navy dark:border-teal bg-transparent',
      ghost: 'bg-transparent',
      destructive: 'bg-danger',
    },
    size: {
      default: 'px-5 py-3.5',
      sm: 'px-4 py-2.5',
      lg: 'px-6 py-4',
    },
    fullWidth: {
      true: 'w-full',
      false: '',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'default',
    fullWidth: false,
  },
});

const textVariants = cva('text-center font-semibold text-base', {
  variants: {
    variant: {
      primary: 'text-ink',
      secondary: 'text-navy dark:text-teal',
      ghost: 'text-navy dark:text-teal',
      destructive: 'text-white',
    },
  },
  defaultVariants: { variant: 'primary' },
});

export interface ButtonProps
  extends Omit<PressableProps, 'children'>,
    VariantProps<typeof buttonVariants> {
  children: string;
  loading?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

export const Button = forwardRef<React.ComponentRef<typeof Pressable>, ButtonProps>(
  ({ children, variant, size, fullWidth, loading, icon, className, disabled, ...rest }, ref) => {
    return (
      <Pressable
        ref={ref}
        accessibilityRole="button"
        disabled={disabled || loading}
        className={cn(buttonVariants({ variant, size, fullWidth }), (disabled || loading) && 'opacity-50', className)}
        {...rest}
      >
        {loading ? (
          <ActivityIndicator color={variant === 'primary' ? '#0A0F1E' : '#06D6A0'} />
        ) : (
          <>
            {icon}
            <Text className={cn(textVariants({ variant }), icon ? 'ml-2' : '')}>{children}</Text>
          </>
        )}
      </Pressable>
    );
  },
);
Button.displayName = 'Button';
