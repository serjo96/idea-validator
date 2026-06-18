import type { TFunction } from 'i18next';
import type { Question } from './types';

type QuestionOptionDef = { score: number; critical?: boolean };
type QuestionDef = { id: string; options: QuestionOptionDef[]; scored?: boolean };

export const questionDefs: QuestionDef[] = [
  {
    id: 'user',
    options: [{ score: 0 }, { score: 1 }, { score: 2 }],
  },
  {
    id: 'behavior',
    options: [{ score: 0, critical: true }, { score: 1 }, { score: 2 }],
  },
  {
    id: 'pain',
    options: [{ score: 0 }, { score: 1 }, { score: 2 }],
  },
  {
    id: 'urgency',
    options: [{ score: 0 }, { score: 1 }, { score: 2 }],
  },
  {
    id: 'stakeholders',
    options: [{ score: 0 }, { score: 1 }, { score: 2 }],
  },
  {
    id: 'payment',
    options: [{ score: 0, critical: true }, { score: 1 }, { score: 2 }],
  },
  {
    id: 'alternatives',
    options: [{ score: 0 }, { score: 1 }, { score: 2 }],
  },
  {
    id: 'access',
    options: [{ score: 0 }, { score: 1 }, { score: 2 }],
  },
  {
    id: 'evidence',
    options: [{ score: 0 }, { score: 1 }, { score: 2 }],
  },
  {
    id: 'test',
    scored: false,
    options: [{ score: 0 }, { score: 1 }, { score: 2 }],
  },
];

export const scoredQuestionDefs = questionDefs.filter((q) => q.scored !== false);

export const MAX_SCORE = scoredQuestionDefs.length * 2;

export const buildQuestions = (t: TFunction): Question[] =>
  questionDefs.map((def) => ({
    id: def.id,
    title: t(`questions.${def.id}.title`),
    why: t(`questions.${def.id}.why`),
    scored: def.scored !== false,
    options: def.options.map((opt, i) => ({
      score: opt.score,
      critical: opt.critical,
      text: t(`questions.${def.id}.options.${i}.text`),
      explanation: t(`questions.${def.id}.options.${i}.explanation`),
    })),
  }));

export const byId = Object.fromEntries(questionDefs.map((q) => [q.id, q]));
