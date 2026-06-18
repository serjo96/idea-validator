import type { ResultCategory, SavedResult } from './types';

const KEY = 'idea-validator-results';
const DRAFT = 'idea-validator-draft';

const LEGACY_CATEGORIES: Record<string, ResultCategory> = {
  'Красивая механика': 'beautifulMechanism',
  'Слабая или неполная гипотеза': 'weakHypothesis',
  'Стоит провести дешёвый тест': 'cheapTest',
  'Сильная гипотеза для проверки': 'strongHypothesis',
};

const migrateAnswers = (answers: Record<string, number>) => {
  if (answers.frequency !== undefined && answers.stakeholders === undefined) {
    const { frequency, ...rest } = answers;
    return { ...rest, stakeholders: frequency };
  }
  return answers;
};

const normalizeResult = (r: SavedResult): SavedResult => ({
  ...r,
  answers: migrateAnswers(r.answers),
  category: LEGACY_CATEGORIES[r.category as string] ?? r.category,
});

export const loadResults = (): SavedResult[] => {
  try {
    return (JSON.parse(localStorage.getItem(KEY) || '[]') as SavedResult[]).map(normalizeResult);
  } catch {
    return [];
  }
};
export const saveResult = (r: SavedResult) =>
  localStorage.setItem(KEY, JSON.stringify([r, ...loadResults().filter((x) => x.id !== r.id)]));
export const deleteResult = (id: string) =>
  localStorage.setItem(KEY, JSON.stringify(loadResults().filter((x) => x.id !== id)));
export const saveDraft = (value: unknown) => localStorage.setItem(DRAFT, JSON.stringify(value));
export const loadDraft = <T>(): T | null => {
  try {
    return JSON.parse(localStorage.getItem(DRAFT) || 'null');
  } catch {
    return null;
  }
};
export const clearDraft = () => localStorage.removeItem(DRAFT);
