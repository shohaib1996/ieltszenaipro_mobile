import { useState } from 'react';
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
} from 'expo-audio';

/**
 * Speaking's answers are recorded locally then uploaded to the backend's
 * /transcribe endpoint (cloud STT) - there is no on-device transcription here,
 * matching the STT approach chosen for this build.
 */
export function useSpeechRecorder() {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [isRecording, setIsRecording] = useState(false);

  const start = async () => {
    const { granted } = await requestRecordingPermissionsAsync();
    if (!granted) {
      throw new Error('Microphone permission was denied');
    }
    await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
    await recorder.prepareToRecordAsync();
    recorder.record();
    setIsRecording(true);
  };

  const stop = async (): Promise<string | null> => {
    if (!isRecording) return null;
    await recorder.stop();
    setIsRecording(false);
    return recorder.uri;
  };

  return { isRecording, start, stop };
}
