import type { Href } from 'expo-router';
import { BookOpenCheck, Headphones, Mic, PenTool, type LucideIcon } from 'lucide-react-native';

export type SkillType = 'IELTS_READING' | 'IELTS_LISTENING' | 'IELTS_WRITING' | 'IELTS_SPEAKING';

export interface SkillMeta {
  type: SkillType;
  label: string;
  icon: LucideIcon;
  startHref: Href;
}

export const SKILLS: SkillMeta[] = [
  { type: 'IELTS_READING', label: 'Reading', icon: BookOpenCheck, startHref: '/reading' },
  { type: 'IELTS_LISTENING', label: 'Listening', icon: Headphones, startHref: '/listening' },
  { type: 'IELTS_WRITING', label: 'Writing', icon: PenTool, startHref: '/writing' },
  { type: 'IELTS_SPEAKING', label: 'Speaking', icon: Mic, startHref: '/speaking' },
];

export function getSkillMeta(type?: string): SkillMeta | undefined {
  return SKILLS.find((s) => s.type === type);
}
