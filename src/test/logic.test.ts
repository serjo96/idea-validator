import { describe, expect, it } from 'vitest';
import { classify, generatePrompt, recommendations, scoreAnswers } from '../logic';
import type { AnswerMap, Idea } from '../types';
const all = (value: number): AnswerMap =>
  Object.fromEntries(
    [
      'user',
      'behavior',
      'pain',
      'urgency',
      'frequency',
      'payment',
      'alternatives',
      'access',
      'evidence',
      'test',
    ].map((id) => [id, value]),
  );
const idea: Idea = {
  name: 'Кофе вовремя',
  description: 'Предзаказ кофе',
  audience: 'Офисные сотрудники',
  interest: '',
};
describe('scoring and prompt', () => {
  it('counts total score', () => expect(scoreAnswers(all(2))).toBe(20));
  it('classifies score bands', () =>
    expect(classify(all(1)).category).toBe('Слабая или неполная гипотеза'));
  it('caps category when two stop factors are zero', () => {
    const a = all(2);
    a.behavior = 0;
    a.evidence = 0;
    expect(classify(a).category).toBe('Слабая или неполная гипотеза');
  });
  it('forces beautiful mechanism when user, behavior and payment are absent', () => {
    const a = all(2);
    a.user = a.behavior = a.payment = 0;
    expect(classify(a).category).toBe('Красивая механика');
  });
  it('builds recommendations from weak criteria', () => {
    const a = all(2);
    a.payment = 0;
    expect(recommendations(a).join(' ')).toContain('транзакцию');
  });
  it('generates a complete structured prompt', () => {
    const p = generatePrompt(idea, all(2), 'Продать вручную');
    expect(p).toContain('Кофе вовремя');
    expect(p).toContain('20/20');
    expect(p).toContain('Продать вручную');
    expect(p).toContain('Не составляй большой бизнес-план');
  });
});
