import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { generatePrompt, resultText } from './logic';
import type { QuizExtras, SavedResult } from './types';
import { aiProviders } from './aiProviders';

const Icon = ({ mark }: { mark: string }) => (
  <span className="provider-icon" aria-hidden="true">
    {mark}
  </span>
);

async function copyText(text: string) {
  if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
  await navigator.clipboard.writeText(text);
}

export function AiSection({ result }: { result: SavedResult }) {
  const { t } = useTranslation();
  const extras: QuizExtras = {
    cheapTest: result.cheapTest,
    strongestFact: result.strongestFact,
    killCriterion: result.killCriterion,
    frequencyDiagnostic: result.frequencyDiagnostic,
  };
  const original = generatePrompt(result.idea, result.answers, extras, t);
  const [prompt, setPrompt] = useState(original);
  const [editor, setEditor] = useState(false);
  const [notice, setNotice] = useState('');
  const [manual, setManual] = useState(false);
  const fallbackRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setPrompt(generatePrompt(result.idea, result.answers, extras, t));
  }, [result, t]);

  useEffect(() => {
    if (!notice) return;
    const id = setTimeout(() => setNotice(''), 3500);
    return () => clearTimeout(id);
  }, [notice]);

  useEffect(() => {
    if (manual) requestAnimationFrame(() => fallbackRef.current?.select());
  }, [manual]);

  const copy = async () => {
    try {
      await copyText(prompt);
      setManual(false);
      setNotice(t('ai.promptCopied'));
    } catch {
      setManual(true);
      setNotice(t('ai.copyFailed'));
    }
  };

  const download = () => {
    const blob = new Blob(
      [resultText(result, t) + '\n\n' + t('ai.downloadPromptHeader') + '\n' + prompt],
      {
        type: 'text/plain;charset=utf-8',
      },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.idea.name || 'idea-result'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="ai-section" aria-labelledby="ask-ai-title">
      <div className="section-kicker">{t('ai.kicker')}</div>
      <h2 id="ask-ai-title">{t('ai.title')}</h2>
      <p className="lead">{t('ai.lead')}</p>
      <div className="provider-grid">
        {aiProviders.map((provider) => (
          <a
            className="provider-card"
            key={provider.id}
            href={provider.buildUrl(prompt)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t('ai.openProvider', { name: provider.name })}
          >
            <Icon mark={provider.iconMark} />
            <span>
              <strong>{provider.name}</strong>
              <small>{t('ai.openWithPrompt')}</small>
            </span>
            <span aria-hidden="true" className="arrow">
              ↗
            </span>
          </a>
        ))}
      </div>
      <div className="ai-actions">
        <button className="button secondary" onClick={() => void copy()}>
          {t('ai.copyPrompt')}
        </button>
        <button
          className="button ghost"
          onClick={() => setEditor((x) => !x)}
          aria-expanded={editor}
        >
          {editor ? t('ai.hidePrompt') : t('ai.showPrompt')}
        </button>
        <button className="button ghost" onClick={download}>
          {t('ai.download')}
        </button>
      </div>
      {notice && (
        <div className="toast" role="status">
          {notice}
        </div>
      )}
      {manual && (
        <div className="manual-copy">
          <label htmlFor="manual-prompt">{t('ai.manualLabel')}</label>
          <textarea id="manual-prompt" ref={fallbackRef} value={prompt} readOnly rows={8} />
        </div>
      )}
      {editor && (
        <div className="prompt-editor">
          <div className="editor-head">
            <div>
              <h3>{t('ai.editorTitle')}</h3>
              <p>{t('ai.editorHint')}</p>
            </div>
            <button
              className="text-button"
              onClick={() => setPrompt(original)}
              disabled={prompt === original}
            >
              {t('ai.restore')}
            </button>
          </div>
          <textarea
            aria-label={t('ai.editablePrompt')}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={18}
          />
          <button className="button secondary" onClick={() => void copy()}>
            {t('ai.copyEdited')}
          </button>
        </div>
      )}
      <p className="ai-warning">{t('ai.warning')}</p>
    </section>
  );
}
