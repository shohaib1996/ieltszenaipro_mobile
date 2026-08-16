export interface TestAnswer {
  id: string;
  sessionId: string;
  questionId: string;
  answerText: string | null;
  isCorrect: boolean;
  score?: number | null;
  feedback?: string | null;
}
