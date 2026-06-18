import type { TFunction } from 'i18next';
import type { Question } from './types';

type QuestionOptionDef = { score: number; critical?: boolean };
type QuestionDef = { id: string; options: QuestionOptionDef[] };

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
    id: 'frequency',
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
    options: [{ score: 0 }, { score: 1 }, { score: 2 }],
  },
];

export const buildQuestions = (t: TFunction): Question[] =>
  questionDefs.map((def) => ({
    id: def.id,
    title: t(`questions.${def.id}.title`),
    why: t(`questions.${def.id}.why`),
    options: def.options.map((opt, i) => ({
      score: opt.score,
      critical: opt.critical,
      text: t(`questions.${def.id}.options.${i}.text`),
      explanation: t(`questions.${def.id}.options.${i}.explanation`),
    })),
  }));

export const byId = Object.fromEntries(questionDefs.map((q) => [q.id, q]));
