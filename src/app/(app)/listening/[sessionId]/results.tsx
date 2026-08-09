import { Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { CircleCheckBig } from 'lucide-react-native';

import { Screen } from '@/components/ui/Screen';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BandScore } from '@/components/ui/BandScore';

export default function ListeningResultsScreen() {
  const { band, rawScore, totalQuestions } = useLocalSearchParams<{
    band: string;
    rawScore: string;
    totalQuestions: string;
  }>();

  return (
    <Screen scroll className="items-center px-6 pt-8">
      <View className="mb-4 h-14 w-14 items-center justify-center rounded-full bg-teal/10">
        <CircleCheckBig size={26} color="#06D6A0" strokeWidth={2} />
      </View>
      <Text className="mb-8 text-center text-lg text-black/60 dark:text-white/60">
        Listening test complete
      </Text>

      <BandScore score={Number(band)} label="Estimated band score" />

      <Card className="my-8 w-full items-center">
        <Text className="text-sm text-black/60 dark:text-white/60">Correct answers</Text>
        <Text className="mt-1 text-2xl font-bold text-black dark:text-white">
          {rawScore} / {totalQuestions}
        </Text>
      </Card>

      <Button fullWidth onPress={() => router.replace('/(app)/(tabs)')}>
        Back to Home
      </Button>
    </Screen>
  );
}
