import { ActivityIndicator, Text, View } from 'react-native';
import { cn } from '@/lib/utils';
import type { ConversationMessage } from '@/types/speaking';

export function ChatBubble({ message, isLoading }: { message: ConversationMessage; isLoading?: boolean }) {
  const isUser = message.role === 'user';
  return (
    <View
      className={cn(
        'mb-3 max-w-[85%] rounded-card px-4 py-3',
        isUser ? 'self-end bg-teal' : 'self-start bg-black/5 dark:bg-white/10',
      )}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={isUser ? '#0A0F1E' : '#06D6A0'} />
      ) : (
        <Text className={cn('text-base leading-5', isUser ? 'text-ink' : 'text-black dark:text-white')}>
          {message.content}
        </Text>
      )}
    </View>
  );
}
