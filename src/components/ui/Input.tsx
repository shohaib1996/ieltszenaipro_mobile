import { forwardRef } from 'react';
import { Text, TextInput, View, type TextInputProps } from 'react-native';
import { cn } from '@/lib/utils';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  className?: string;
}

export const Input = forwardRef<TextInput, InputProps>(({ label, error, className, ...rest }, ref) => {
  return (
    <View className="w-full">
      {label ? <Text className="mb-1.5 text-sm font-medium text-black dark:text-white">{label}</Text> : null}
      <TextInput
        ref={ref}
        placeholderTextColor="#60646C"
        className={cn(
          'w-full rounded-card border border-black/10 bg-white px-4 py-3.5 text-base text-black',
          'dark:border-white/10 dark:bg-navy dark:text-white',
          'focus:border-teal',
          error ? 'border-danger' : '',
          className,
        )}
        {...rest}
      />
      {error ? <Text className="mt-1 text-xs text-danger">{error}</Text> : null}
    </View>
  );
});
Input.displayName = 'Input';
