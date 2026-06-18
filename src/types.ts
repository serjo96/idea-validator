export type AnswerOption = { text: string; score: number; explanation: string; critical?: boolean };
export type Question = { id: string; title: string; why: string; options: AnswerOption[] };
export type Idea = { name: string; description: string; audience: string; interest: string };
export type AnswerMap = Record<string, number>;
export type ResultCategory =
  | 'Красивая механика'
  | 'Слабая или неполная гипотеза'
  | 'Стоит провести дешёвый тест'
  | 'Сильная гипотеза для проверки';
export type SavedResult = {
  id: string;
  createdAt: string;
  idea: Idea;
  answers: AnswerMap;
  cheapTest: string;
  score: number;
  category: ResultCategory;
};
