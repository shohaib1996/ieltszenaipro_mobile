export type WritingTaskType = 'TASK1' | 'TASK2';

export interface WritingCriteriaScores {
  taskScore: number;
  coherenceCohesion: number;
  lexicalResource: number;
  grammaticalRange: number;
}

export interface WritingTaskPayload {
  id: string;
  task: WritingTaskType;
  promptText: string;
  imageUrl: string | null;
  difficulty: string | null;
  submissionId: string;
  submittedText?: string | null;
  score?: number | null;
  criteriaScores?: WritingCriteriaScores | null;
  wordCount?: number | null;
  feedback?: string | null;
}

export interface WritingGradeResult {
  criteriaScores: WritingCriteriaScores;
  band: number;
  wordCount: number;
  feedback: string;
}
