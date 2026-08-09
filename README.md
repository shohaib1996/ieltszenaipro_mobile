# IELTSZen AI — Mobile

Student-facing React Native/Expo app for IELTS practice (Reading, Listening, Writing,
Speaking) with AI-graded results. Talks to the existing `ai-mock-interview-backend` API —
no separate backend for this app.

## Stack

- Expo (managed workflow) + Expo Router (file-based routing)
- NativeWind v4 (Tailwind for React Native)
- Redux Toolkit + RTK Query, axios-based `baseQuery` (mirrors the web app's `src/redux/api`)
- `expo-secure-store` for the JWT (Keychain/Keystore, not AsyncStorage)
- `expo-audio` (Listening playback, Speaking recording) + `expo-speech` (examiner TTS)

## Getting started

1. Start the backend first (`ai-mock-interview-backend`, `npm run dev`, default port 5000).
2. Copy `.env.example` to `.env` and point `EXPO_PUBLIC_API_URL` at the backend:
   - Simulator/emulator on the same machine: `http://localhost:5000/api/v1` (Android
     emulator specifically needs `http://10.0.2.2:5000/api/v1`).
   - Physical device: use your computer's LAN IP, e.g. `http://192.168.1.23:5000/api/v1`.
3. `npm install`
4. `npm run start` (or `npm run android` / `npm run ios` / `npm run web`)

## Structure

```
src/
  app/            Expo Router screens: (auth) group, (app) group (tab shell + module flows)
  components/ui/  Themed primitives (Button, Card, Input, BandScore, ...) encoding the
                  brand's contrast rules so they can't be misused
  components/test/  Shared Reading/Listening/Speaking pieces (question renderer, audio
                  player, chat bubble)
  redux/          Store, RTK Query API slices (one per backend module), auth/settings slices
  hooks/          useCountdown, useExamTts, useSpeechRecorder, useAuthBootstrap
  types/          Response/domain types mirroring the backend's actual JSON shapes
```

## Known gaps before store submission

- App icon/splash are still Expo's default placeholder assets — swap
  `assets/images/icon.png`, `android-icon-*.png`, `splash-icon.png`, `favicon.png` for real
  branded artwork.
- Speaking's cloud transcription depends on a small backend addition
  (`POST /speaking-tests/:sessionId/transcribe`) that ships alongside this app.
- No "forgot password" self-serve flow — the backend only has an authenticated
  change-password endpoint, so the app is honest about that rather than faking a flow.
- See `mobileappplan.txt` (in the `ai-mock-interview-client` repo) for the full App
  Store / Play Store prerequisites and timeline (developer accounts, Google's closed-testing
  requirement, privacy policy, etc.) — those are process steps, not code.
