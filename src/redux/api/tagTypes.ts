export const tagTypes = {
  Users: 'Users',
  UserDashboard: 'UserDashboard',
  Session: 'Session',
  ReadingTest: 'ReadingTest',
  ListeningTest: 'ListeningTest',
  WritingTest: 'WritingTest',
  SpeakingTest: 'SpeakingTest',
} as const;

export const tagTypesList = Object.values(tagTypes);
