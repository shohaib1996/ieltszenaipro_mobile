import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { formatDistanceToNow } from 'date-fns';
import { BookOpenCheck, Headphones, Mic, PenTool, type LucideIcon } from 'lucide-react-native';

import { Screen } from '@/components/ui/Screen';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { useAppSelector } from '@/redux/hooks';
import { useGetAllSessionsQuery } from '@/redux/api/sessionApi';

const SKILL_META: Record<string, { label: string; icon: LucideIcon }> = {
  IELTS_READING: { label: 'Reading', icon: BookOpenCheck },
  IELTS_LISTENING: { label: 'Listening', icon: Headphones },
  IELTS_WRITING: { label: 'Writing', icon: PenTool },
  IELTS_SPEAKING: { label: 'Speaking', icon: Mic },
};

const FILTERS = [
  { value: null, label: 'All' },
  { value: 'IELTS_READING', label: 'Reading' },
  { value: 'IELTS_LISTENING', label: 'Listening' },
  { value: 'IELTS_WRITING', label: 'Writing' },
  { value: 'IELTS_SPEAKING', label: 'Speaking' },
] as const;

export default function ProgressScreen() {
  const userId = useAppSelector((s) => s.auth.user?.id);
  const [skillFilter, setSkillFilter] = useState<string | null>(null);
  // getAllSessions isn't auto-scoped server-side — userId must be passed explicitly,
  // otherwise it returns every student's sessions, not just this user's.
  const { data, isLoading } = useGetAllSessionsQuery({ userId }, { skip: !userId });
  const sessions = data?.data ?? [];
  const completed = sessions.filter((s) => s.endedAt && (!skillFilter || s.type === skillFilter));

  return (
    <Screen scroll className="px-6 pb-28 pt-4">
      <Text className="mb-1 text-2xl font-extrabold text-black dark:text-white">Progress</Text>
      <Text className="mb-4 text-base text-black/60 dark:text-white/60">
        Your completed practice sessions, most recent first.
      </Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-6 mb-4 px-6">
        <View className="flex-row gap-2">
          {FILTERS.map(({ value, label }) => {
            const active = skillFilter === value;
            return (
              <Pressable
                key={label}
                onPress={() => setSkillFilter(value)}
                className={cn('rounded-full px-4 py-2', active ? 'bg-teal' : 'bg-black/5 dark:bg-white/10')}
              >
                <Text className={cn('text-sm font-semibold', active ? 'text-ink' : 'text-black dark:text-white')}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {isLoading ? (
        <ActivityIndicator className="mt-10" color="#06D6A0" />
      ) : completed.length === 0 ? (
        <Card className="items-center py-10">
          <Text className="text-center text-black/60 dark:text-white/60">
            {skillFilter
              ? `No completed ${SKILL_META[skillFilter]?.label ?? ''} sessions yet.`
              : 'No completed sessions yet. Finish a practice test to see it here.'}
          </Text>
        </Card>
      ) : (
        <View className="gap-3">
          {completed.map((session) => {
            const meta = SKILL_META[session.type] ?? { label: session.type, icon: BookOpenCheck };
            const Icon = meta.icon;
            return (
              <Card key={session.id} className="flex-row items-center">
                <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-teal/10">
                  <Icon size={18} color="#06D6A0" strokeWidth={2} />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-black dark:text-white">{meta.label}</Text>
                  <Text className="text-xs text-black/50 dark:text-white/50">
                    {formatDistanceToNow(new Date(session.startedAt), { addSuffix: true })}
                  </Text>
                </View>
                <Text className="text-xl font-extrabold text-navy dark:text-teal">
                  {session.score != null ? session.score.toFixed(1) : '—'}
                </Text>
              </Card>
            );
          })}
        </View>
      )}
    </Screen>
  );
}
