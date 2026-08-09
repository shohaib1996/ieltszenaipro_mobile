import { View } from 'react-native';
import { cn } from '@/lib/utils';

export function ProgressBar({
  value,
  max = 100,
  className,
}: {
  value: number;
  max?: number;
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <View className={cn('h-2 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10', className)}>
      <View className="h-full rounded-full bg-teal" style={{ width: `${pct}%` }} />
    </View>
  );
}
