import type { TFunction } from 'i18next';
import { buildQuestions, byId, questionDefs } from './questions';
import type { AnswerMap, Idea, ResultCategory, SavedResult } from './types';

const CRITICAL_IDS = ['behavior', 'pain', 'payment', 'evidence'] as const;
const REC_IDS = ['user', 'behavior', 'payment', 'alternatives', 'evidence', 'test'] as const;

export const categoryLabel = (category: ResultCategory, t: TFunction) =>
  t(`categories.${category}.label`);

export const categoryDescription = (category: ResultCategory, t: TFunction) =>
  t(`categories.${category}.description`);

export const scoreAnswers = (answers: AnswerMap) =>
  questionDefs.reduce((sum, q) => sum + (q.options[answers[q.id]]?.score ?? 0), 0);

export const answerScore = (answers: AnswerMap, id: string) =>
  byId[id].options[answers[id]]?.score ?? 0;

export function classify(answers: AnswerMap, t: TFunction): {
  score: number;
  category: ResultCategory;
  stopFactors: string[];
} {
  const questions = buildQuestions(t);
  const questionById = Object.fromEntries(questions.map((q) => [q.id, q]));
  const score = scoreAnswers(answers);
  const critical = CRITICAL_IDS.filter((id) => answerScore(answers, id) === 0);
  const stopFactors = critical.map((id) => questionById[id].title);
  if (['user', 'behavior', 'payment'].every((id) => answerScore(answers, id) === 0))
    return { score, category: 'beautifulMechanism', stopFactors };
  let category: ResultCategory =
    score <= 6
      ? 'beautifulMechanism'
      : score <= 11
        ? 'weakHypothesis'
        : score <= 16
          ? 'cheapTest'
          : 'strongHypothesis';
  if (critical.length >= 2 && !['beautifulMechanism', 'weakHypothesis'].includes(category))
    category = 'weakHypothesis';
  return { score, category, stopFactors };
}

export const recommendations = (answers: AnswerMap, t: TFunction) =>
  REC_IDS.filter((id) => answerScore(answers, id) < 2).map((id) => t(`recommendations.${id}`));

export function generatePrompt(idea: Idea, answers: AnswerMap, cheapTest: string, t: TFunction): string {
  const questions = buildQuestions(t);
  const result = classify(answers, t);
  const rows = questions
    .map(
      (q, i) =>
        `${i + 1}. ${q.title}\n${t('prompt.answer')}: ${q.options[answers[q.id]]?.text ?? t('prompt.noAnswer')} (${q.options[answers[q.id]]?.score ?? 0}/2)`,
    )
    .join('\n\n');
  return `${t('prompt.intro')}\n\n${t('prompt.tasks')}\n\n${t('prompt.format')}\n\n${t('prompt.testData')}\n${t('prompt.name')}: ${idea.name}\n${t('prompt.description')}: ${idea.description}\n${t('prompt.audience')}: ${idea.audience}\n${t('prompt.interest')}: ${idea.interest || t('common.notSpecified')}\n\n${t('prompt.answers')}\n${rows}\n\n${t('prompt.appResult')}\n${t('prompt.score')}: ${result.score}/20\n${t('prompt.category')}: ${categoryLabel(result.category, t)}\n${t('prompt.stopFactors')}: ${result.stopFactors.length ? result.stopFactors.join('; ') : t('common.notTriggered')}\n${t('prompt.cheapestTest')}: ${cheapTest || t('common.notSpecified')}`;
}

export const makeResult = (idea: Idea, answers: AnswerMap, cheapTest: string, t: TFunction): SavedResult => {
  const r = classify(answers, t);
  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    idea,
    answers: { ...answers },
    cheapTest,
    ...r,
  };
};

export const resultText = (r: SavedResult, t: TFunction) =>
  `${r.idea.name}\n${r.score}/20 — ${categoryLabel(r.category, t)}\n\n${categoryDescription(r.category, t)}\n\n${t('result.nextSteps')}\n${recommendations(
    r.answers,
    t,
  )
    .map((x) => `• ${x}`)
    .join('\n')}`;
