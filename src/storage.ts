import type { SavedResult } from './types';
const KEY = 'idea-validator-results';
const DRAFT = 'idea-validator-draft';
export const loadResults = (): SavedResult[] => {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
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
