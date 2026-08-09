import { Text, View } from 'react-native';
import { cn } from '@/lib/utils';

/**
 * The IELTS 0-9 band score, displayed as the single dominant number on a results
 * screen (per the design doc's "one clear visual hierarchy" rule) — never restyled
 * as a percentage or star rating.
 */
export function BandScore({
  score,
  label,
  size = 'lg',
  className,
}: {
  score: number;
  label?: string;
  size?: 'lg' | 'md';
  className?: string;
}) {
  return (
    <View className={cn('items-center', className)}>
      <Text
        className={cn(
          // Teal fails as text on a light background at any size (1.89:1 — rule 1),
          // so light mode uses navy instead; dark mode uses the signature teal (rule 3).
          'font-extrabold text-navy dark:text-teal',
          size === 'lg' ? 'text-7xl' : 'text-4xl',
        )}
      >
        {score.toFixed(1)}
      </Text>
      {label ? (
        <Text className="mt-1 text-sm font-medium text-black/60 dark:text-white/60">{label}</Text>
      ) : null}
    </View>
  );
}
