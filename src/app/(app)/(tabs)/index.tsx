import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { BookOpenCheck, Headphones, Mic, PenTool } from 'lucide-react-native';

import { Screen } from '@/components/ui/Screen';
import { Card } from '@/components/ui/Card';
import { BandScore } from '@/components/ui/BandScore';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAppSelector } from '@/redux/hooks';
import { useGetUserDashboardDataQuery } from '@/redux/api/userDashboardApi';

const SKILL_MODULES = [
  { key: 'avgReadingScore', label: 'Reading', icon: BookOpenCheck, href: '/reading' as const },
  { key: 'avgListeningScore', label: 'Listening', icon: Headphones, href: '/listening' as const },
  { key: 'avgWritingScore', label: 'Writing', icon: PenTool, href: '/writing' as const },
  { key: 'avgSpeakingScore', label: 'Speaking', icon: Mic, href: '/speaking' as const },
] as const;

export default function HomeScreen() {
  const user = useAppSelector((s) => s.auth.user);
  const { data, isLoading } = useGetUserDashboardDataQuery(undefined);
  const stats = data?.data?.stats;
  const firstName = user?.name?.split(' ')[0] ?? 'there';

  return (
    <Screen scroll className="px-6 pb-28 pt-4">
      <Text className="text-2xl font-extrabold text-black dark:text-white">Hi, {firstName} 👋</Text>
      <Text className="mb-6 text-base text-black/60 dark:text-white/60">
        Ready to push your band score higher today?
      </Text>

      {isLoading ? (
        <>
          <Card className="mb-6 items-center bg-navy dark:bg-navy">
            <Skeleton className="mb-2 h-5 w-44 bg-white/10" />
            <Skeleton className="h-12 w-28 bg-white/15" />
          </Card>

          <Skeleton className="mb-3 h-7 w-36" />
          <View className="flex-row flex-wrap gap-3">
            {SKILL_MODULES.map(({ key }) => (
              <Card key={key} className="w-[47%] items-start">
                <Skeleton className="mb-3 h-10 w-10 rounded-full" />
                <Skeleton className="mb-2 h-6 w-20" />
                <Skeleton className="h-8 w-14" />
              </Card>
            ))}
          </View>
        </>
      ) : (
        <>
          <Card className="mb-6 items-center bg-navy dark:bg-navy">
            <Text className="mb-1 text-sm font-medium text-white/70">Overall estimated band</Text>
            <BandScore score={stats?.overallIeltsBand ?? 0} size="md" onDark />
          </Card>

          <Text className="mb-3 text-lg font-bold text-black dark:text-white">Practice a skill</Text>
          <View className="flex-row flex-wrap gap-3">
            {SKILL_MODULES.map(({ key, label, icon: Icon, href }) => (
              <Pressable key={key} onPress={() => router.push(href)} className="w-[47%] active:opacity-80">
                <Card className="items-start">
                  <View className="mb-3 h-10 w-10 items-center justify-center rounded-full bg-teal/10">
                    <Icon size={20} color="#06D6A0" strokeWidth={2} />
                  </View>
                  <Text className="mb-1 text-base font-semibold text-black dark:text-white">{label}</Text>
                  <Text className="text-2xl font-extrabold text-navy dark:text-teal">
                    {(stats?.[key] ?? 0).toFixed(1)}
                  </Text>
                </Card>
              </Pressable>
            ))}
          </View>
        </>
      )}
    </Screen>
  );
}
