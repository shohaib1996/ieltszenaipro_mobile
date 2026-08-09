export interface DashboardStats {
  avgListeningScore: number;
  avgReadingScore: number;
  avgWritingScore: number;
  avgSpeakingScore: number;
  overallIeltsBand: number;
  avgMockInterviewScore: number;
  totalSessionsCompleted: number;
  totalQuizzesTaken: number;
  quizAccuracy: number;
  strongestSkill: string;
  weakestSkill: string;
  totalTimePracticed: number;
}

export interface DashboardData {
  stats: DashboardStats;
  charts: unknown;
}
