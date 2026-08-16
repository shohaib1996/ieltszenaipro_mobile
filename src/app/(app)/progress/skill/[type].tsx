import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { formatDistanceToNow } from 'date-fns';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react-native';

import { Screen } from '@/components/ui/Screen';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { useAppSelector } from '@/redux/hooks';
import { useGetAllSessionsQuery } from '@/redux/api/sessionApi';
import { getSkillMeta } from '@/lib/skills';
import type { TestSession } from '@/types/test';

const PAGE_SIZE = 10;

function SessionRow({
  session,
  isLast,
  startHref,
}: {
  session: TestSession;
  isLast: boolean;
  startHref: Href;
}) {
  const complete = !!session.endedAt;
  return (
    <Pressable
      onPress={() =>
        complete
          ? router.push({ pathname: '/progress/[sessionId]', params: { sessionId: session.id } })
          : router.push(startHref)
      }
      className={cn('flex-row items-center gap-3 py-3', !isLast && 'border-b border-black/5 dark:border-white/5')}
    >
      <View className="flex-1">
        <Text className="text-sm font-semibold text-black dark:text-white">
          {formatDistanceToNow(new Date(session.startedAt), { addSuffix: true })}
        </Text>
        <View className={cn('mt-1 self-start rounded-full px-2 py-0.5', complete ? 'bg-teal/10' : 'bg-danger/10')}>
          <Text className={cn('text-xs font-semibold', complete ? 'text-teal' : 'text-danger')}>
            {complete ? 'Completed' : 'Incomplete'}
          </Text>
        </View>
      </View>
      {complete ? (
        <Text className="text-lg font-extrabold text-navy dark:text-teal">
          {session.score != null ? session.score.toFixed(1) : '—'}
        </Text>
      ) : null}
      <ChevronRight size={18} color="#8A8F98" strokeWidth={2} />
    </Pressable>
  );
}

export default function SkillSessionsScreen() {
  const { type } = useLocalSearchParams<{ type: string }>();
  const userId = useAppSelector((s) => s.auth.user?.id);
  const [page, setPage] = useState(1);
  const skill = getSkillMeta(type);
  const Icon = skill?.icon;

  const { data, isLoading, isFetching } = useGetAllSessionsQuery(
    { userId, type, page, limit: PAGE_SIZE },
    { skip: !userId || !type },
  );
  const sessions = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta ? Math.max(1, Math.ceil(meta.total / meta.limit)) : 1;

  return (
    <Screen scroll className="px-6 pb-28 pt-4">
      <Pressable onPress={() => router.back()} className="mb-4 flex-row items-center gap-2 self-start">
        <ArrowLeft size={18} color="#06D6A0" strokeWidth={2} />
        <Text className="text-sm font-semibold text-navy dark:text-teal">Progress</Text>
      </Pressable>

      <View className="mb-5 flex-row items-center gap-3">
        {Icon ? (
          <View className="h-11 w-11 items-center justify-center rounded-full bg-teal/10">
            <Icon size={20} color="#06D6A0" strokeWidth={2} />
          </View>
        ) : null}
        <View className="flex-1">
          <Text className="text-2xl font-extrabold text-black dark:text-white">{skill?.label ?? 'Sessions'}</Text>
          <Text className="text-sm text-black/50 dark:text-white/50">
            {meta ? `${meta.total} session${meta.total === 1 ? '' : 's'}` : ' '}
          </Text>
        </View>
      </View>

      {isLoading ? (
        <ActivityIndicator className="mt-10" color="#06D6A0" />
      ) : sessions.length === 0 ? (
        <Card className="items-center py-10">
          <Text className="text-center text-black/60 dark:text-white/60">No sessions yet.</Text>
        </Card>
      ) : (
        <Card>
          {sessions.map((session, index) => (
            <SessionRow
              key={session.id}
              session={session}
              isLast={index === sessions.length - 1}
              startHref={skill?.startHref ?? '/'}
            />
          ))}
        </Card>
      )}

      {totalPages > 1 ? (
        <View className="mt-4 flex-row items-center justify-between">
          <Pressable
            disabled={page <= 1 || isFetching}
            onPress={() => setPage((p) => Math.max(1, p - 1))}
            className={cn(
              'flex-row items-center gap-1 rounded-full px-3 py-2',
              page <= 1 ? 'opacity-30' : 'bg-black/5 dark:bg-white/10',
            )}
          >
            <ChevronLeft size={16} color="#06D6A0" strokeWidth={2} />
            <Text className="text-sm font-semibold text-navy dark:text-teal">Prev</Text>
          </Pressable>

          <Text className="text-sm text-black/60 dark:text-white/60">
            Page {page} of {totalPages}
          </Text>

          <Pressable
            disabled={page >= totalPages || isFetching}
            onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
            className={cn(
              'flex-row items-center gap-1 rounded-full px-3 py-2',
              page >= totalPages ? 'opacity-30' : 'bg-black/5 dark:bg-white/10',
            )}
          >
            <Text className="text-sm font-semibold text-navy dark:text-teal">Next</Text>
            <ChevronRight size={16} color="#06D6A0" strokeWidth={2} />
          </Pressable>
        </View>
      ) : null}
    </Screen>
  );
}
