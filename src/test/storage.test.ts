import { describe, expect, it } from 'vitest';
import { deleteResult, loadResults, saveResult } from '../storage';
import type { SavedResult } from '../types';
const item: SavedResult = {
  id: 'one',
  createdAt: '2026-01-01',
  idea: { name: 'A', description: 'B', audience: 'C', interest: '' },
  answers: {},
  cheapTest: '',
  score: 0,
  category: 'Красивая механика',
};
describe('local repository', () => {
  it('saves, loads and deletes results', () => {
    saveResult(item);
    expect(loadResults()).toEqual([item]);
    deleteResult('one');
    expect(loadResults()).toEqual([]);
  });
});
