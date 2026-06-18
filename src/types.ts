export type AnswerOption = { text: string; score: number; explanation: string; critical?: boolean };
export type Question = {
  id: string;
  title: string;
  why: string;
  options: AnswerOption[];
  scored?: boolean;
};
export type Idea = { name: string; description: string; audience: string; interest: string };
export type AnswerMap = Record<string, number>;
export type ResultCategory =
  | 'beautifulMechanism'
  | 'weakHypothesis'
  | 'cheapTest'
  | 'strongHypothesis';
export type QuizExtras = {
  cheapTest: string;
  strongestFact?: string;
  killCriterion?: string;
  frequencyDiagnostic?: number;
};
export type SavedResult = {
  id: string;
  createdAt: string;
  idea: Idea;
  answers: AnswerMap;
  cheapTest: string;
  strongestFact?: string;
  killCriterion?: string;
  frequencyDiagnostic?: number;
  score: number;
  category: ResultCategory;
};
