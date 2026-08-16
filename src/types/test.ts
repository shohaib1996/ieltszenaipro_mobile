export type QuestionType =
  | 'MCQ'
  | 'OPEN_ENDED'
  | 'TRUE_FALSE_NOT_GIVEN'
  | 'YES_NO_NOT_GIVEN'
  | 'MATCHING'
  | 'COMPLETION'
  | 'SHORT_ANSWER'
  | 'DIAGRAM_LABEL';

export interface TestQuestion {
  id: string;
  type: QuestionType;
  text: string;
  options: string[];
  correctAnswer?: string | null;
  imageUrl?: string | null;
}

export interface ReadingPassage {
  id: string;
  order: number | null;
  title: string;
  content: string;
  questions: TestQuestion[];
}

export interface ReadingTest {
  id: string;
  title: string;
  passages: ReadingPassage[];
}

export interface TestSession {
  id: string;
  userId?: string;
  type: string;
  startedAt: string;
  endedAt: string | null;
  score: number | null;
  transcript?: string | null;
  feedback?: string | Record<string, unknown> | null;
  aiChatConversations?: {
    id: string;
    sessionId: string;
    conversation: {
      role: 'user' | 'assistant';
      content: string;
      part?: number;
    }[];
    createdAt: string;
  }[];
  writingSubmissions?: unknown[];
}
