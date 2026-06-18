import type { TFunction } from 'i18next';
import { buildQuestions, byId, MAX_SCORE, scoredQuestionDefs } from './questions';
import type { AnswerMap, Idea, QuizExtras, ResultCategory, SavedResult } from './types';

const CRITICAL_IDS = ['behavior', 'pain', 'payment', 'evidence'] as const;
const REC_IDS = ['user', 'behavior', 'payment', 'alternatives', 'evidence', 'test'] as const;

export { MAX_SCORE };

export const categoryLabel = (category: ResultCategory, t: TFunction) =>
  t(`categories.${category}.label`);

export const categoryDescription = (category: ResultCategory, t: TFunction) =>
  t(`categories.${category}.description`);

export const scoreAnswers = (answers: AnswerMap) =>
  scoredQuestionDefs.reduce((sum, q) => sum + (q.options[answers[q.id]]?.score ?? 0), 0);

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
    score <= 5
      ? 'beautifulMechanism'
      : score <= 10
        ? 'weakHypothesis'
        : score <= 14
          ? 'cheapTest'
          : 'strongHypothesis';
  if (critical.length >= 2 && !['beautifulMechanism', 'weakHypothesis'].includes(category))
    category = 'weakHypothesis';
  return { score, category, stopFactors };
}

export const recommendations = (answers: AnswerMap, t: TFunction) =>
  REC_IDS.filter((id) => answerScore(answers, id) < 2).map((id) => t(`recommendations.${id}`));

const frequencyLabel = (frequency: number | undefined, t: TFunction) => {
  if (frequency === undefined) return t('common.notSpecified');
  return t(`diagnostics.frequency.options.${frequency}.text`);
};

export function generatePrompt(
  idea: Idea,
  answers: AnswerMap,
  extras: QuizExtras,
  t: TFunction,
): string {
  const questions = buildQuestions(t);
  const result = classify(answers, t);
  const scoredRows = questions
    .filter((q) => q.scored !== false)
    .map(
      (q, i) =>
        `${i + 1}. ${q.title}\n${t('prompt.answer')}: ${q.options[answers[q.id]]?.text ?? t('prompt.noAnswer')} (${q.options[answers[q.id]]?.score ?? 0}/2)`,
    )
    .join('\n\n');
  const diagnosticRows = questions
    .filter((q) => q.scored === false)
    .map(
      (q) =>
        `${q.title}\n${t('prompt.answer')}: ${q.options[answers[q.id]]?.text ?? t('prompt.noAnswer')} (${t('prompt.diagnostic')})`,
    )
    .join('\n\n');
  const optionalRows = [
    `${t('diagnostics.frequency.title')}: ${frequencyLabel(extras.frequencyDiagnostic, t)}`,
    `${t('quiz.strongestFactTitle')}: ${extras.strongestFact || t('common.notSpecified')}`,
    `${t('quiz.killCriterionTitle')}: ${extras.killCriterion || t('common.notSpecified')}`,
    `${t('prompt.cheapestTest')}: ${extras.cheapTest || t('common.notSpecified')}`,
  ].join('\n');
  return `${t('prompt.intro')}\n\n${t('prompt.tasks')}\n\n${t('prompt.format')}\n\n${t('prompt.testData')}\n${t('prompt.name')}: ${idea.name}\n${t('prompt.description')}: ${idea.description}\n${t('prompt.audience')}: ${idea.audience}\n${t('prompt.interest')}: ${idea.interest || t('common.notSpecified')}\n\n${t('prompt.answers')}\n${scoredRows}\n\n${t('prompt.diagnostics')}\n${diagnosticRows}\n\n${optionalRows}\n\n${t('prompt.appResult')}\n${t('prompt.score')}: ${result.score}/${MAX_SCORE}\n${t('prompt.category')}: ${categoryLabel(result.category, t)}\n${t('prompt.stopFactors')}: ${result.stopFactors.length ? result.stopFactors.join('; ') : t('common.notTriggered')}`;
}

export const makeResult = (
  idea: Idea,
  answers: AnswerMap,
  extras: QuizExtras,
  t: TFunction,
): SavedResult => {
  const r = classify(answers, t);
  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    idea,
    answers: { ...answers },
    ...extras,
    ...r,
  };
};

export const resultText = (r: SavedResult, t: TFunction) =>
  `${r.idea.name}\n${r.score}/${MAX_SCORE} — ${categoryLabel(r.category, t)}\n\n${categoryDescription(r.category, t)}\n\n${t('result.nextSteps')}\n${recommendations(
    r.answers,
    t,
  )
    .map((x) => `• ${x}`)
    .join('\n')}`;
