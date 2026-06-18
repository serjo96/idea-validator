import { questions, byId } from './questions';
import type { AnswerMap, Idea, ResultCategory, SavedResult } from './types';

export const scoreAnswers = (answers: AnswerMap) =>
  questions.reduce((sum, q) => sum + (q.options[answers[q.id]]?.score ?? 0), 0);
export const answerScore = (answers: AnswerMap, id: string) =>
  byId[id].options[answers[id]]?.score ?? 0;

export function classify(answers: AnswerMap): {
  score: number;
  category: ResultCategory;
  stopFactors: string[];
} {
  const score = scoreAnswers(answers);
  const critical = ['behavior', 'pain', 'payment', 'evidence'].filter(
    (id) => answerScore(answers, id) === 0,
  );
  const stopFactors = critical.map((id) => byId[id].title);
  if (['user', 'behavior', 'payment'].every((id) => answerScore(answers, id) === 0))
    return { score, category: 'Красивая механика', stopFactors };
  let category: ResultCategory =
    score <= 6
      ? 'Красивая механика'
      : score <= 11
        ? 'Слабая или неполная гипотеза'
        : score <= 16
          ? 'Стоит провести дешёвый тест'
          : 'Сильная гипотеза для проверки';
  if (
    critical.length >= 2 &&
    !['Красивая механика', 'Слабая или неполная гипотеза'].includes(category)
  )
    category = 'Слабая или неполная гипотеза';
  return { score, category, stopFactors };
}

export const categoryCopy: Record<ResultCategory, string> = {
  'Красивая механика':
    'Пока в идее больше интересной концепции, чем подтверждённой проблемы. Не переходи к разработке. Сначала найди конкретного пользователя и проверь, пытается ли он уже решить эту задачу.',
  'Слабая или неполная гипотеза':
    'В идее может быть полезная функция или нишевый сценарий, но бизнес-ценность пока недостаточно выражена. Нужно уточнить аудиторию, силу проблемы и момент оплаты.',
  'Стоит провести дешёвый тест':
    'Есть признаки реальной проблемы, но пока недостаточно доказательств. Не строй полноценный продукт. Проведи один короткий тест и собери наблюдаемое поведение.',
  'Сильная гипотеза для проверки':
    'У идеи есть понятный пользователь, существующее поведение и заметная ценность. Следующий этап — не разработка полноценного продукта, а проверка спроса через продажи, заявки или ручное оказание услуги.',
};

const recs: Record<string, string> = {
  user: 'Опиши одного конкретного пользователя и ситуацию, в которой у него возникает проблема.',
  behavior:
    'Найди 5 человек и спроси, когда они последний раз сталкивались с этой задачей и что сделали.',
  payment:
    'Найди существующую транзакцию или бюджет, рядом с которым продукт может получать деньги.',
  alternatives: 'Попроси пользователей показать текущий процесс решения проблемы пошагово.',
  evidence:
    'Не спрашивай, нравится ли идея. Проверь действие: заявка, предзаказ, согласие на интервью или готовность заплатить.',
  test: 'Сформулируй одну ключевую гипотезу и способ проверить её вручную без разработки.',
};
export const recommendations = (answers: AnswerMap) =>
  Object.entries(recs)
    .filter(([id]) => answerScore(answers, id) < 2)
    .map(([, text]) => text);

export function generatePrompt(idea: Idea, answers: AnswerMap, cheapTest: string): string {
  const result = classify(answers);
  const rows = questions
    .map(
      (q, i) =>
        `${i + 1}. ${q.title}\nОтвет: ${q.options[answers[q.id]]?.text ?? 'Нет ответа'} (${q.options[answers[q.id]]?.score ?? 0}/2)`,
    )
    .join('\n\n');
  return `Проанализируй бизнес-идею критически. Не пытайся подтвердить её перспективность и не придумывай преимущества без оснований.\n\nНайди предположения, которые пользователь выдаёт за факты. Покажи главные слабые места. Определи, существует ли реальная проблема или только интересная механика. Скажи, кто и за что конкретно может заплатить. Предложи один минимальный тест без полноценной разработки. В конце вынеси решение: проверять сейчас, уточнить гипотезу или архивировать.\n\nНе составляй большой бизнес-план. Ответ должен быть прямым и компактным.\n\nДАННЫЕ ТЕСТА\nНазвание: ${idea.name}\nОписание: ${idea.description}\nЦелевая аудитория: ${idea.audience}\nПочему идея интересна: ${idea.interest || 'Не указано'}\n\nОТВЕТЫ\n${rows}\n\nИТОГ ПРИЛОЖЕНИЯ\nБаллы: ${result.score}/20\nКатегория: ${result.category}\nСтоп-факторы: ${result.stopFactors.length ? result.stopFactors.join('; ') : 'Не сработали'}\nСамый дешёвый тест: ${cheapTest || 'Не указан'}`;
}

export const makeResult = (idea: Idea, answers: AnswerMap, cheapTest: string): SavedResult => {
  const r = classify(answers);
  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    idea,
    answers: { ...answers },
    cheapTest,
    ...r,
  };
};
export const resultText = (r: SavedResult) =>
  `${r.idea.name}\n${r.score}/20 — ${r.category}\n\n${categoryCopy[r.category]}\n\nСледующие шаги:\n${recommendations(
    r.answers,
  )
    .map((x) => `• ${x}`)
    .join('\n')}`;
