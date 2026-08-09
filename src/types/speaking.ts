export interface SpeakingTest {
  id: string;
  part1Topic: string;
  part1Questions: string[];
  cueCardTopic: string;
  cueCardBullets: string[];
  part2FollowUpQuestions: string[];
  part3Questions: string[];
  difficulty: string;
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface SpeakingCriteriaScores {
  fluencyCoherence: number;
  lexicalResource: number;
  grammaticalRange: number;
  pronunciation: number;
}

export interface SpeakingAnalyzeResult {
  band: number;
  criteriaScores: SpeakingCriteriaScores;
  feedback: string;
}
