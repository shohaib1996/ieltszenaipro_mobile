import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { router, type Href } from 'expo-router';
import { formatDistanceToNow } from 'date-fns';
import {
  BookOpenCheck,
  ChevronDown,
  ChevronRight,
  Headphones,
  Mic,
  PenTool,
  type LucideIcon,
} from 'lucide-react-native';

import { Screen } from '@/components/ui/Screen';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { useAppSelector } from '@/redux/hooks';
import { useGetAllSessionsQuery } from '@/redux/api/sessionApi';
import type { TestSession } from '@/types/test';

const SKILLS: { type: string; label: string; icon: LucideIcon; startHref: Href }[] = [
  { type: 'IELTS_READING', label: 'Reading', icon: BookOpenCheck, startHref: '/reading' },
  { type: 'IELTS_LISTENING', label: 'Listening', icon: Headphones, startHref: '/listening' },
  { type: 'IELTS_WRITING', label: 'Writing', icon: PenTool, startHref: '/writing' },
  { type: 'IELTS_SPEAKING', label: 'Speaking', icon: Mic, startHref: '/speaking' },
];

function SessionRow({ session, isLast }: { session: TestSession; isLast: boolean }) {
  const complete = !!session.endedAt;
  return (
    <Pressable
      onPress={() =>
        complete
          ? router.push({ pathname: '/progress/[sessionId]', params: { sessionId: session.id } })
          : router.push(SKILLS.find((s) => s.type === session.type)?.startHref ?? '/')
      }
      className={cn(
        'flex-row items-center gap-3 py-3',
        !isLast && 'border-b border-black/5 dark:border-white/5',
      )}
    >
      <View className="flex-1">
        <Text className="text-sm font-semibold text-black dark:text-white">
          {formatDistanceToNow(new Date(session.startedAt), { addSuffix: true })}
        </Text>
        <View
          className={cn(
            'mt-1 self-start rounded-full px-2 py-0.5',
            complete ? 'bg-teal/10' : 'bg-danger/10',
          )}
        >
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

function SkillSection({ skill, userId }: { skill: (typeof SKILLS)[number]; userId?: string }) {
  const Icon = skill.icon;
  const [expanded, setExpanded] = useState(false);
  // Fetched per-skill (not one shared "all sessions" call): the backend defaults to
  // returning only 10 sessions total with no ordering when `type` isn't passed, so a user
  // with 10+ sessions in one skill could silently starve out every other skill's sessions.
  const { data, isLoading } = useGetAllSessionsQuery(
    { userId, type: skill.type, limit: 50 },
    { skip: !userId },
  );
  const sessions = (data?.data ?? [])
    .slice()
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
  const completedCount = sessions.filter((s) => s.endedAt).length;
  const incompleteCount = sessions.length - completedCount;

  return (
    <Card>
      <Pressable
        onPress={() => sessions.length > 0 && setExpanded((v) => !v)}
        className="flex-row items-center gap-3"
      >
        <View className="h-10 w-10 items-center justify-center rounded-full bg-teal/10">
          <Icon size={18} color="#06D6A0" strokeWidth={2} />
        </View>
        <View className="flex-1">
          <Text className="text-base font-bold text-black dark:text-white">{skill.label}</Text>
          <Text className="text-xs text-black/50 dark:text-white/50">
            {isLoading
              ? 'Loading…'
              : sessions.length === 0
                ? 'No sessions yet'
                : `${completedCount} completed${incompleteCount ? ` · ${incompleteCount} incomplete` : ''}`}
          </Text>
        </View>
        {isLoading ? (
          <ActivityIndicator color="#06D6A0" />
        ) : sessions.length > 0 ? (
          expanded ? (
            <ChevronDown size={18} color="#8A8F98" strokeWidth={2} />
          ) : (
            <ChevronRight size={18} color="#8A8F98" strokeWidth={2} />
          )
        ) : null}
      </Pressable>

      {!isLoading && sessions.length === 0 ? (
        <Pressable onPress={() => router.push(skill.startHref)} className="mt-3 flex-row items-center justify-between">
          <Text className="text-sm font-semibold text-navy dark:text-teal">Start practicing</Text>
          <ChevronRight size={18} color="#8A8F98" strokeWidth={2} />
        </Pressable>
      ) : null}

      {expanded && sessions.length > 0 ? (
        <View className="mt-1">
          {sessions.map((session, index) => (
            <SessionRow key={session.id} session={session} isLast={index === sessions.length - 1} />
          ))}
        </View>
      ) : null}
    </Card>
  );
}

export default function ProgressScreen() {
  const userId = useAppSelector((s) => s.auth.user?.id);

  return (
    <Screen scroll className="px-6 pb-28 pt-4">
      <Text className="mb-1 text-2xl font-extrabold text-black dark:text-white">Progress</Text>
      <Text className="mb-4 text-base text-black/60 dark:text-white/60">
        Every section, with completed and incomplete sessions at a glance.
      </Text>

      <View className="gap-4">
        {SKILLS.map((skill) => (
          <SkillSection key={skill.type} skill={skill} userId={userId} />
        ))}
      </View>
    </Screen>
  );
}
