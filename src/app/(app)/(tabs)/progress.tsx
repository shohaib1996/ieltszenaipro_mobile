import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { router, type Href } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';

import { Screen } from '@/components/ui/Screen';
import { Card } from '@/components/ui/Card';
import { useAppSelector } from '@/redux/hooks';
import { useGetAllSessionsQuery } from '@/redux/api/sessionApi';
import { SKILLS, type SkillMeta } from '@/lib/skills';

function SkillCard({ skill, userId }: { skill: SkillMeta; userId?: string }) {
  const Icon = skill.icon;
  // Only fetched to compute the completed/incomplete summary below — the actual
  // session list lives on its own paginated screen, not rendered inline here.
  const { data, isLoading } = useGetAllSessionsQuery(
    { userId, type: skill.type, limit: 50 },
    { skip: !userId },
  );
  const sessions = data?.data ?? [];
  const completedCount = sessions.filter((s) => s.endedAt).length;
  const incompleteCount = sessions.length - completedCount;

  return (
    <Pressable
      onPress={() => router.push(`/progress/skill/${skill.type}` as Href)}
      className="active:opacity-80"
    >
      <Card className="flex-row items-center gap-3">
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
        ) : (
          <ChevronRight size={18} color="#8A8F98" strokeWidth={2} />
        )}
      </Card>
    </Pressable>
  );
}

export default function ProgressScreen() {
  const userId = useAppSelector((s) => s.auth.user?.id);

  return (
    <Screen scroll className="px-6 pb-28 pt-4">
      <Text className="mb-1 text-2xl font-extrabold text-black dark:text-white">Progress</Text>
      <Text className="mb-4 text-base text-black/60 dark:text-white/60">
        Tap a section to see your completed and incomplete sessions.
      </Text>

      <View className="gap-3">
        {SKILLS.map((skill) => (
          <SkillCard key={skill.type} skill={skill} userId={userId} />
        ))}
      </View>
    </Screen>
  );
}
