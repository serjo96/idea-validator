import { useEffect, useMemo, useState } from 'react';
import { questions } from './questions';
import { categoryCopy, classify, makeResult, recommendations, resultText } from './logic';
import { clearDraft, deleteResult, loadDraft, loadResults, saveDraft, saveResult } from './storage';
import { AiSection } from './AiSection';
import type { AnswerMap, Idea, SavedResult } from './types';

type Screen = 'home' | 'about' | 'quiz' | 'result' | 'history';
type Draft = { screen: Screen; idea: Idea; answers: AnswerMap; step: number; cheapTest: string };
const emptyIdea: Idea = { name: '', description: '', audience: '', interest: '' };

export default function App() {
  const draft = useMemo(() => loadDraft<Draft>(), []);
  const [screen, setScreen] = useState<Screen>(draft?.screen === 'quiz' ? 'quiz' : 'home');
  const [idea, setIdea] = useState(draft?.idea ?? emptyIdea);
  const [answers, setAnswers] = useState<AnswerMap>(draft?.answers ?? {});
  const [step, setStep] = useState(draft?.step ?? 0);
  const [cheapTest, setCheapTest] = useState(draft?.cheapTest ?? '');
  const [result, setResult] = useState<SavedResult | null>(null);
  const [history, setHistory] = useState(loadResults);
  const [copied, setCopied] = useState('');
  useEffect(() => {
    if (screen === 'quiz') saveDraft({ screen, idea, answers, step, cheapTest });
  }, [screen, idea, answers, step, cheapTest]);
  const flash = (s: string) => {
    setCopied(s);
    setTimeout(() => setCopied(''), 2500);
  };
  const reset = () => {
    setIdea(emptyIdea);
    setAnswers({});
    setStep(0);
    setCheapTest('');
    setResult(null);
    clearDraft();
    setScreen('about');
  };
  const finish = () => {
    const r = makeResult(idea, answers, cheapTest);
    saveResult(r);
    setHistory(loadResults());
    setResult(r);
    clearDraft();
    setScreen('result');
  };
  const openResult = (r: SavedResult) => {
    setResult(r);
    setScreen('result');
  };
  if (screen === 'home')
    return (
      <Shell onHistory={() => setScreen('history')}>
        <main className="hero">
          <div className="hero-copy">
            <div className="eyebrow">Idea reality check · 3–5 минут</div>
            <h1>Отдели реальную проблему от красивой механики.</h1>
            <p>
              Короткий структурированный тест покажет качество гипотезы и предложит следующий
              дешёвый шаг — без AI и ложной точности.
            </p>
            <div className="hero-actions">
              <button className="button primary" onClick={() => setScreen('about')}>
                Проверить идею
              </button>
              {draft && (
                <button className="button secondary" onClick={() => setScreen('quiz')}>
                  Продолжить тест
                </button>
              )}
            </div>
            <p className="fine">Это первичный фильтр, а не доказательство жизнеспособности.</p>
          </div>
          <div className="hero-card" aria-label="Что вы получите">
            <span>01</span>
            <h2>10 вопросов</h2>
            <p>О пользователе, поведении, ценности, оплате и доказательствах.</p>
            <span>02</span>
            <h2>Чёткий следующий шаг</h2>
            <p>Результат рассчитывается по прозрачным правилам.</p>
          </div>
        </main>
      </Shell>
    );
  if (screen === 'about')
    return (
      <Shell onHistory={() => setScreen('history')}>
        <main className="narrow">
          <button className="back" onClick={() => setScreen('home')}>
            ← На главную
          </button>
          <div className="eyebrow">Перед началом</div>
          <h1>Коротко опиши идею</h1>
          <p className="lead">Достаточно пары конкретных предложений. Это не питч для инвестора.</p>
          <form
            className="idea-form"
            onSubmit={(e) => {
              e.preventDefault();
              setScreen('quiz');
            }}
          >
            <Field
              label="Название идеи"
              value={idea.name}
              onChange={(name) => setIdea({ ...idea, name })}
              required
            />
            <Field
              label="Описание в 2–5 предложениях"
              value={idea.description}
              onChange={(description) => setIdea({ ...idea, description })}
              area
              required
            />
            <Field
              label="Кто предполагаемый пользователь"
              value={idea.audience}
              onChange={(audience) => setIdea({ ...idea, audience })}
              required
            />
            <Field
              label="Почему идея кажется интересной (необязательно)"
              value={idea.interest}
              onChange={(interest) => setIdea({ ...idea, interest })}
              area
            />
            <button className="button primary" type="submit">
              Перейти к вопросам →
            </button>
          </form>
        </main>
      </Shell>
    );
  if (screen === 'quiz') {
    const final = step === questions.length;
    const q = questions[step];
    return (
      <Shell>
        <main className="quiz">
          <div className="progress-meta">
            <span>{final ? 'Последний шаг' : `Вопрос ${step + 1} из ${questions.length}`}</span>
            <span>{Math.round((step / (questions.length + 1)) * 100)}%</span>
          </div>
          <div className="progress">
            <i style={{ width: `${((step + 1) / (questions.length + 1)) * 100}%` }} />
          </div>
          {!final ? (
            <>
              <h1>{q.title}</h1>
              <p className="why">{q.why}</p>
              <fieldset className="options" aria-label={q.title}>
                {q.options.map((o, i) => (
                  <label className={answers[q.id] === i ? 'selected' : ''} key={o.text}>
                    <input
                      type="radio"
                      name={q.id}
                      checked={answers[q.id] === i}
                      onChange={() => setAnswers({ ...answers, [q.id]: i })}
                    />
                    <span className="option-mark">{String.fromCharCode(65 + i)}</span>
                    <span>{o.text}</span>
                    <span className="check">✓</span>
                  </label>
                ))}
              </fieldset>
            </>
          ) : (
            <>
              <h1>Какой самый дешёвый тест идеи ты сейчас видишь?</h1>
              <p className="why">
                Не влияет на баллы, но станет частью итогового отчёта и AI-промпта.
              </p>
              <textarea
                className="cheap-test"
                value={cheapTest}
                onChange={(e) => setCheapTest(e.target.value)}
                rows={7}
                placeholder="Например: предложить ручной сервис десяти владельцам небольших кофеен…"
              />
            </>
          )}
          <div className="quiz-nav">
            <button
              className="button ghost"
              onClick={() => (step ? setStep(step - 1) : setScreen('about'))}
            >
              ← Назад
            </button>
            {final ? (
              <button className="button primary" onClick={finish}>
                Показать результат
              </button>
            ) : (
              <button
                className="button primary"
                disabled={answers[q.id] === undefined}
                onClick={() => setStep(step + 1)}
              >
                Далее →
              </button>
            )}
          </div>
        </main>
      </Shell>
    );
  }
  if (screen === 'history')
    return (
      <Shell>
        <main className="wide">
          <button className="back" onClick={() => setScreen('home')}>
            ← На главную
          </button>
          <div className="eyebrow">Сохранено локально</div>
          <h1>История проверок</h1>
          {!history.length ? (
            <div className="empty">
              <h2>Здесь пока пусто</h2>
              <p>Пройди первый тест — результат сохранится только в этом браузере.</p>
              <button className="button primary" onClick={() => setScreen('about')}>
                Проверить идею
              </button>
            </div>
          ) : (
            <div className="history-list">
              {history.map((r) => (
                <article key={r.id}>
                  <div>
                    <time>{new Date(r.createdAt).toLocaleDateString('ru-RU')}</time>
                    <h2>{r.idea.name}</h2>
                    <p>
                      {r.score}/20 · {r.category}
                    </p>
                  </div>
                  <div>
                    <button className="button secondary" onClick={() => openResult(r)}>
                      Открыть
                    </button>
                    <button
                      className="text-button danger"
                      onClick={() => {
                        deleteResult(r.id);
                        setHistory(loadResults());
                      }}
                    >
                      Удалить
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </main>
      </Shell>
    );
  if (!result) return null;
  const r = classify(result.answers);
  const recs = recommendations(result.answers);
  const strong = questions.filter((q) => q.options[result.answers[q.id]]?.score === 2);
  const weak = questions.filter((q) => q.options[result.answers[q.id]]?.score === 0);
  return (
    <Shell onHistory={() => setScreen('history')}>
      <main className="result-page">
        <section className="result-hero">
          <div>
            <button className="back light" onClick={() => setScreen('history')}>
              ← К истории
            </button>
            <div className="eyebrow">Результат проверки</div>
            <h1>{result.idea.name}</h1>
            <div className="category">{r.category}</div>
            <p>{categoryCopy[r.category]}</p>
          </div>
          <div
            className="score-ring"
            style={{ '--score': `${(r.score / 20) * 360}deg` } as React.CSSProperties}
          >
            <div>
              <strong>{r.score}</strong>
              <span>из 20</span>
            </div>
          </div>
        </section>
        <p className="disclaimer">
          Результат не доказывает, что идея успешна или неуспешна. Он показывает качество текущей
          гипотезы и помогает выбрать следующий шаг.
        </p>
        <section className="result-grid">
          <ResultBlock
            title="Сильные стороны"
            items={strong.map((q) => q.options[result.answers[q.id]].explanation)}
            empty="Сильные сигналы пока не выявлены."
          />
          <ResultBlock
            title="Слабые стороны"
            items={weak.map((q) => q.options[result.answers[q.id]].explanation)}
            empty="Явных слабых сигналов нет — но их всё равно нужно проверить."
          />
        </section>
        {r.stopFactors.length > 0 && (
          <section className="stop">
            <h2>Сработали стоп-факторы</h2>
            <p>Они ограничили итоговую категорию, даже если сумма баллов выше.</p>
            <ul>
              {r.stopFactors.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </section>
        )}
        <section className="next">
          <div className="section-kicker">Не строй — проверь</div>
          <h2>Рекомендуемое следующее действие</h2>
          <ol>
            {recs.slice(0, 3).map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ol>
        </section>
        <details className="answers">
          <summary>Все ответы по критериям</summary>
          {questions.map((q) => (
            <div key={q.id}>
              <span>{q.title}</span>
              <strong>{q.options[result.answers[q.id]].score}/2</strong>
              <p>{q.options[result.answers[q.id]].text}</p>
            </div>
          ))}
        </details>
        <div className="result-actions">
          <button
            className="button secondary"
            onClick={() =>
              navigator.clipboard
                .writeText(resultText(result))
                .then(() => flash('Результат скопирован'))
            }
          >
            Скопировать результат
          </button>
          <button
            className="button ghost"
            onClick={() => {
              saveResult(result);
              flash('Результат сохранён');
            }}
          >
            Сохранить результат
          </button>
          <button className="button ghost" onClick={reset}>
            Проверить другую идею
          </button>
        </div>
        {copied && (
          <div className="toast" role="status">
            {copied}
          </div>
        )}
        <AiSection key={result.id} result={result} />
      </main>
    </Shell>
  );
}

function Shell({ children, onHistory }: { children: React.ReactNode; onHistory?: () => void }) {
  return (
    <>
      <header>
        <button className="brand" onClick={() => location.reload()}>
          <i />
          Idea Validator
        </button>
        {onHistory && (
          <button className="header-link" onClick={onHistory}>
            История
          </button>
        )}
      </header>
      {children}
      <footer>Детерминированная оценка · Данные остаются в браузере</footer>
    </>
  );
}
function Field({
  label,
  value,
  onChange,
  area = false,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  area?: boolean;
  required?: boolean;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {area ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          rows={4}
        />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} required={required} />
      )}
    </label>
  );
}
function ResultBlock({ title, items, empty }: { title: string; items: string[]; empty: string }) {
  return (
    <section className="result-block">
      <h2>{title}</h2>
      {items.length ? (
        <ul>
          {items.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      ) : (
        <p>{empty}</p>
      )}
    </section>
  );
}
