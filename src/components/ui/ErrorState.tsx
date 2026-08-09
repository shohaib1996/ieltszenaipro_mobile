import { Text, View } from 'react-native';
import { TriangleAlert } from 'lucide-react-native';

import { Button } from './Button';

export function ErrorState({
  title,
  message,
  actionLabel,
  onAction,
}: {
  title: string;
  message: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <View className="flex-1 items-center justify-center px-8">
      <View className="mb-5 h-14 w-14 items-center justify-center rounded-full bg-danger/10">
        <TriangleAlert size={26} color="#EF4444" strokeWidth={2} />
      </View>
      <Text className="mb-2 text-center text-xl font-bold text-black dark:text-white">{title}</Text>
      <Text className="mb-6 text-center text-base text-black/60 dark:text-white/60">{message}</Text>
      <Button variant="secondary" onPress={onAction}>
        {actionLabel}
      </Button>
    </View>
  );
}
