import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { buildQuestions } from './questions';
import {
  categoryDescription,
  categoryLabel,
  classify,
  makeResult,
  recommendations,
  resultText,
} from './logic';
import { clearDraft, deleteResult, loadDraft, loadResults, saveDraft, saveResult } from './storage';
import { AiSection } from './AiSection';
import { setStoredLanguage, type AppLanguage } from './i18n';
import type { AnswerMap, Idea, SavedResult } from './types';

type Screen = 'home' | 'about' | 'quiz' | 'result' | 'history';
type Draft = { screen: Screen; idea: Idea; answers: AnswerMap; step: number; cheapTest: string };
const emptyIdea: Idea = { name: '', description: '', audience: '', interest: '' };

export default function App() {
  const { t, i18n } = useTranslation();
  const questions = useMemo(() => buildQuestions(t), [t, i18n.language]);
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
    const r = makeResult(idea, answers, cheapTest, t);
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
  const changeLanguage = (lang: AppLanguage) => {
    setStoredLanguage(lang);
    void i18n.changeLanguage(lang);
  };
  if (screen === 'home')
    return (
      <Shell onHistory={() => setScreen('history')} onLanguageChange={changeLanguage}>
        <main className="hero">
          <div className="hero-copy">
            <div className="eyebrow">{t('home.eyebrow')}</div>
            <h1>{t('home.title')}</h1>
            <p>{t('home.lead')}</p>
            <div className="hero-actions">
              <button className="button primary" onClick={() => setScreen('about')}>
                {t('home.start')}
              </button>
              {draft && (
                <button className="button secondary" onClick={() => setScreen('quiz')}>
                  {t('home.resume')}
                </button>
              )}
            </div>
            <p className="fine">{t('home.fine')}</p>
          </div>
          <div className="hero-card" aria-label={t('home.cardLabel')}>
            <span>01</span>
            <h2>{t('home.card1Title')}</h2>
            <p>{t('home.card1Text')}</p>
            <span>02</span>
            <h2>{t('home.card2Title')}</h2>
            <p>{t('home.card2Text')}</p>
          </div>
        </main>
      </Shell>
    );
  if (screen === 'about')
    return (
      <Shell onHistory={() => setScreen('history')} onLanguageChange={changeLanguage}>
        <main className="narrow">
          <button className="back" onClick={() => setScreen('home')}>
            {t('common.backHome')}
          </button>
          <div className="eyebrow">{t('about.eyebrow')}</div>
          <h1>{t('about.title')}</h1>
          <p className="lead">{t('about.lead')}</p>
          <form
            className="idea-form"
            onSubmit={(e) => {
              e.preventDefault();
              setScreen('quiz');
            }}
          >
            <Field
              label={t('about.nameLabel')}
              value={idea.name}
              onChange={(name) => setIdea({ ...idea, name })}
              required
            />
            <Field
              label={t('about.descriptionLabel')}
              value={idea.description}
              onChange={(description) => setIdea({ ...idea, description })}
              area
              required
            />
            <Field
              label={t('about.audienceLabel')}
              value={idea.audience}
              onChange={(audience) => setIdea({ ...idea, audience })}
              required
            />
            <Field
              label={t('about.interestLabel')}
              value={idea.interest}
              onChange={(interest) => setIdea({ ...idea, interest })}
              area
            />
            <button className="button primary" type="submit">
              {t('about.submit')}
            </button>
          </form>
        </main>
      </Shell>
    );
  if (screen === 'quiz') {
    const final = step === questions.length;
    const q = questions[step];
    return (
      <Shell onLanguageChange={changeLanguage}>
        <main className="quiz">
          <div className="progress-meta">
            <span>
              {final
                ? t('quiz.finalStep')
                : t('quiz.progress', { current: step + 1, total: questions.length })}
            </span>
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
              <h1>{t('quiz.cheapTestTitle')}</h1>
              <p className="why">{t('quiz.cheapTestWhy')}</p>
              <textarea
                className="cheap-test"
                value={cheapTest}
                onChange={(e) => setCheapTest(e.target.value)}
                rows={7}
                placeholder={t('quiz.cheapTestPlaceholder')}
              />
            </>
          )}
          <div className="quiz-nav">
            <button
              className="button ghost"
              onClick={() => (step ? setStep(step - 1) : setScreen('about'))}
            >
              {t('common.back')}
            </button>
            {final ? (
              <button className="button primary" onClick={finish}>
                {t('quiz.showResult')}
              </button>
            ) : (
              <button
                className="button primary"
                disabled={answers[q.id] === undefined}
                onClick={() => setStep(step + 1)}
              >
                {t('common.next')}
              </button>
            )}
          </div>
        </main>
      </Shell>
    );
  }
  if (screen === 'history')
    return (
      <Shell onLanguageChange={changeLanguage}>
        <main className="wide">
          <button className="back" onClick={() => setScreen('home')}>
            {t('common.backHome')}
          </button>
          <div className="eyebrow">{t('history.eyebrow')}</div>
          <h1>{t('history.title')}</h1>
          {!history.length ? (
            <div className="empty">
              <h2>{t('history.emptyTitle')}</h2>
              <p>{t('history.emptyText')}</p>
              <button className="button primary" onClick={() => setScreen('about')}>
                {t('history.start')}
              </button>
            </div>
          ) : (
            <div className="history-list">
              {history.map((r) => (
                <article key={r.id}>
                  <div>
                    <time>{new Date(r.createdAt).toLocaleDateString(i18n.language)}</time>
                    <h2>{r.idea.name}</h2>
                    <p>
                      {r.score}/20 · {categoryLabel(r.category, t)}
                    </p>
                  </div>
                  <div>
                    <button className="button secondary" onClick={() => openResult(r)}>
                      {t('common.open')}
                    </button>
                    <button
                      className="text-button danger"
                      onClick={() => {
                        deleteResult(r.id);
                        setHistory(loadResults());
                      }}
                    >
                      {t('common.delete')}
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
  const r = classify(result.answers, t);
  const recs = recommendations(result.answers, t);
  const strong = questions.filter((q) => q.options[result.answers[q.id]]?.score === 2);
  const weak = questions.filter((q) => q.options[result.answers[q.id]]?.score === 0);
  return (
    <Shell onHistory={() => setScreen('history')} onLanguageChange={changeLanguage}>
      <main className="result-page">
        <section className="result-hero">
          <div>
            <button className="back light" onClick={() => setScreen('history')}>
              {t('common.backHistory')}
            </button>
            <div className="eyebrow">{t('result.eyebrow')}</div>
            <h1>{result.idea.name}</h1>
            <div className="category">{categoryLabel(r.category, t)}</div>
            <p>{categoryDescription(r.category, t)}</p>
          </div>
          <div
            className="score-ring"
            style={{ '--score': `${(r.score / 20) * 360}deg` } as React.CSSProperties}
          >
            <div>
              <strong>{r.score}</strong>
              <span>{t('common.outOf', { total: 20 })}</span>
            </div>
          </div>
        </section>
        <p className="disclaimer">{t('result.disclaimer')}</p>
        <section className="result-grid">
          <ResultBlock
            title={t('result.strengths')}
            items={strong.map((q) => q.options[result.answers[q.id]].explanation)}
            empty={t('result.strengthsEmpty')}
          />
          <ResultBlock
            title={t('result.weaknesses')}
            items={weak.map((q) => q.options[result.answers[q.id]].explanation)}
            empty={t('result.weaknessesEmpty')}
          />
        </section>
        {r.stopFactors.length > 0 && (
          <section className="stop">
            <h2>{t('result.stopTitle')}</h2>
            <p>{t('result.stopText')}</p>
            <ul>
              {r.stopFactors.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </section>
        )}
        <section className="next">
          <div className="section-kicker">{t('result.nextKicker')}</div>
          <h2>{t('result.nextTitle')}</h2>
          <ol>
            {recs.slice(0, 3).map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ol>
        </section>
        <details className="answers">
          <summary>{t('result.allAnswers')}</summary>
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
                .writeText(resultText(result, t))
                .then(() => flash(t('result.copied')))
            }
          >
            {t('result.copy')}
          </button>
          <button
            className="button ghost"
            onClick={() => {
              saveResult(result);
              flash(t('result.saved'));
            }}
          >
            {t('result.save')}
          </button>
          <button className="button ghost" onClick={reset}>
            {t('result.reset')}
          </button>
        </div>
        {copied && (
          <div className="toast" role="status">
            {copied}
          </div>
        )}
        <AiSection key={`${result.id}-${i18n.language}`} result={result} />
      </main>
    </Shell>
  );
}

function Shell({
  children,
  onHistory,
  onLanguageChange,
}: {
  children: React.ReactNode;
  onHistory?: () => void;
  onLanguageChange: (lang: AppLanguage) => void;
}) {
  const { t, i18n } = useTranslation();
  return (
    <>
      <header>
        <button className="brand" onClick={() => location.reload()}>
          <i />
          {t('shell.brand')}
        </button>
        <div className="header-actions">
          <div className="lang-switch" role="group" aria-label={t('shell.language')}>
            {(['ru', 'en'] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                className={`lang-button${i18n.language === lang ? ' active' : ''}`}
                aria-pressed={i18n.language === lang}
                onClick={() => onLanguageChange(lang)}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>
          {onHistory && (
            <button className="header-link" onClick={onHistory}>
              {t('shell.history')}
            </button>
          )}
        </div>
      </header>
      {children}
      <footer>{t('shell.footer')}</footer>
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
