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
  onDark = false,
  className,
}: {
  score: number;
  label?: string;
  size?: 'lg' | 'md';
  /** Set when the surrounding container is always-navy (e.g. a navy card), regardless of
   * light/dark mode — the default light/dark text colors below assume the score sits
   * directly on the screen's own background, which flips between white and near-black. */
  onDark?: boolean;
  className?: string;
}) {
  return (
    <View className={cn('items-center', className)}>
      <Text
        className={cn(
          // Teal fails as text on a light background at any size (1.89:1 — rule 1),
          // so light mode uses navy instead; dark mode uses the signature teal (rule 3).
          'font-extrabold',
          onDark ? 'text-teal' : 'text-navy dark:text-teal',
          size === 'lg' ? 'text-7xl' : 'text-4xl',
        )}
      >
        {score.toFixed(1)}
      </Text>
      {label ? (
        <Text
          className={cn(
            'mt-1 text-sm font-medium',
            onDark ? 'text-white/60' : 'text-black/60 dark:text-white/60',
          )}
        >
          {label}
        </Text>
      ) : null}
    </View>
  );
}
