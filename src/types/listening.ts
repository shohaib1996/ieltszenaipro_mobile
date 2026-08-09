import type { TestQuestion } from './test';

export type ListeningContext =
  | 'SOCIAL_CONVERSATION'
  | 'SOCIAL_MONOLOGUE'
  | 'EDUCATIONAL_CONVERSATION'
  | 'ACADEMIC_MONOLOGUE';

export interface ListeningSection {
  id: string;
  order: number | null;
  title: string;
  audioUrl: string;
  context: ListeningContext | null;
  questions: TestQuestion[];
}

export interface ListeningTest {
  id: string;
  title: string;
  sections: ListeningSection[];
}
