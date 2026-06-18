export type AnswerOption = { text: string; score: number; explanation: string; critical?: boolean };
export type Question = { id: string; title: string; why: string; options: AnswerOption[] };
export type Idea = { name: string; description: string; audience: string; interest: string };
export type AnswerMap = Record<string, number>;
export type ResultCategory =
  | 'beautifulMechanism'
  | 'weakHypothesis'
  | 'cheapTest'
  | 'strongHypothesis';
export type SavedResult = {
  id: string;
  createdAt: string;
  idea: Idea;
  answers: AnswerMap;
  cheapTest: string;
  score: number;
  category: ResultCategory;
};
