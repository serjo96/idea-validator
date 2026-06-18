import { describe, expect, it } from 'vitest';
import i18n from '../i18n';
import { classify, generatePrompt, MAX_SCORE, recommendations, scoreAnswers } from '../logic';
import type { AnswerMap, Idea } from '../types';

const t = i18n.getFixedT('ru');

const all = (value: number): AnswerMap =>
  Object.fromEntries(
    [
      'user',
      'behavior',
      'pain',
      'urgency',
      'stakeholders',
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
  it('counts total score without diagnostic test question', () =>
    expect(scoreAnswers(all(2))).toBe(MAX_SCORE));
  it('classifies score bands', () =>
    expect(classify(all(1), t).category).toBe('weakHypothesis'));
  it('caps category when two stop factors are zero', () => {
    const a = all(2);
    a.behavior = 0;
    a.evidence = 0;
    expect(classify(a, t).category).toBe('weakHypothesis');
  });
  it('forces beautiful mechanism when user, behavior and payment are absent', () => {
    const a = all(2);
    a.user = a.behavior = a.payment = 0;
    expect(classify(a, t).category).toBe('beautifulMechanism');
  });
  it('builds recommendations from weak criteria', () => {
    const a = all(2);
    a.payment = 0;
    expect(recommendations(a, t).join(' ')).toContain('транзакцию');
  });
  it('generates a complete structured prompt', () => {
    const p = generatePrompt(
      idea,
      all(2),
      { cheapTest: 'Продать вручную', strongestFact: 'Три жалобы', killCriterion: 'Нет оплат' },
      t,
    );
    expect(p).toContain('Кофе вовремя');
    expect(p).toContain(`${MAX_SCORE}/${MAX_SCORE}`);
    expect(p).toContain('Продать вручную');
    expect(p).toContain('Три жалобы');
    expect(p).toContain('Не составляй большой бизнес-план');
  });
});
