import { useEffect, useRef } from 'react';
import { Text, View } from 'react-native';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { Check, Play } from 'lucide-react-native';

import { Button } from '@/components/ui/Button';

/**
 * Real IELTS Listening audio plays exactly once, with no pause/rewind/replay —
 * this mirrors that: once pressed, the button locks out further plays for good,
 * regardless of whether the student was actually listening.
 */
export function SinglePlayAudioButton({
  audioUrl,
  hasPlayed,
  onPlayed,
}: {
  audioUrl: string;
  hasPlayed: boolean;
  onPlayed: () => void;
}) {
  const player = useAudioPlayer(null);
  const status = useAudioPlayerStatus(player);
  const loadedUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (loadedUrlRef.current !== audioUrl) {
      loadedUrlRef.current = audioUrl;
      player.replace({ uri: audioUrl });
    }
  }, [audioUrl, player]);

  useEffect(() => {
    if (status.didJustFinish) {
      onPlayed();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status.didJustFinish]);

  const handlePress = () => {
    if (hasPlayed || status.playing) return;
    player.play();
  };

  return (
    <View className="items-center py-6">
      <Button
        variant={hasPlayed ? 'secondary' : 'primary'}
        disabled={hasPlayed}
        icon={hasPlayed ? <Check size={18} color="#06D6A0" /> : <Play size={18} color="#0A0F1E" />}
        onPress={handlePress}
      >
        {hasPlayed ? 'Played' : status.playing ? 'Playing…' : 'Play Section Audio'}
      </Button>
      <Text className="mt-3 text-center text-xs text-black/40 dark:text-white/40">
        Plays once, like the real exam — no rewind or replay.
      </Text>
    </View>
  );
}
