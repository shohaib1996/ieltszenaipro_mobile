import { forwardRef, useState } from 'react';
import { Pressable, Text, TextInput, View, type TextInputProps } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { cn } from '@/lib/utils';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  className?: string;
}

export const Input = forwardRef<TextInput, InputProps>(
  ({ label, error, className, secureTextEntry, ...rest }, ref) => {
    const [visible, setVisible] = useState(false);
    // secureTextEntry is only ever passed (as `true`) on password fields, so its presence
    // doubles as the signal to render the show/hide toggle — no extra prop needed per screen.
    const isPasswordField = secureTextEntry === true;

    return (
      <View className="w-full">
        {label ? <Text className="mb-1.5 text-sm font-medium text-black dark:text-white">{label}</Text> : null}
        <View className="justify-center">
          <TextInput
            ref={ref}
            placeholderTextColor="#60646C"
            secureTextEntry={isPasswordField && !visible}
            className={cn(
              'w-full rounded-card border border-black/10 bg-white px-4 py-3.5 text-base text-black',
              'dark:border-white/10 dark:bg-navy dark:text-white',
              'focus:border-teal',
              isPasswordField ? 'pr-12' : '',
              error ? 'border-danger' : '',
              className,
            )}
            {...rest}
          />
          {isPasswordField ? (
            <Pressable
              onPress={() => setVisible((v) => !v)}
              hitSlop={8}
              className="absolute right-4"
            >
              {visible ? (
                <EyeOff size={20} color="#60646C" strokeWidth={2} />
              ) : (
                <Eye size={20} color="#60646C" strokeWidth={2} />
              )}
            </Pressable>
          ) : null}
        </View>
        {error ? <Text className="mt-1 text-xs text-danger">{error}</Text> : null}
      </View>
    );
  },
);
Input.displayName = 'Input';
