import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { SavedResult } from './types';
import { generatePrompt, resultText } from './logic';

export type AiProvider = {
  id: 'chatgpt' | 'claude' | 'gemini';
  name: string;
  url: string;
  icon: ReactNode;
  supportsPromptPrefill: boolean;
  buildUrl?: (prompt: string) => string;
};
const Icon = ({ mark }: { mark: string }) => (
  <span className="provider-icon" aria-hidden="true">
    {mark}
  </span>
);
const aiProviders: AiProvider[] = [
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    url: 'https://chatgpt.com/',
    icon: <Icon mark="◎" />,
    supportsPromptPrefill: false,
  },
  {
    id: 'claude',
    name: 'Claude by Anthropic',
    url: 'https://claude.ai/',
    icon: <Icon mark="A" />,
    supportsPromptPrefill: false,
  },
  {
    id: 'gemini',
    name: 'Gemini by Google',
    url: 'https://gemini.google.com/',
    icon: <Icon mark="✦" />,
    supportsPromptPrefill: false,
  },
];

async function copyText(text: string) {
  if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
  await navigator.clipboard.writeText(text);
}

export function AiSection({ result }: { result: SavedResult }) {
  const original = generatePrompt(result.idea, result.answers, result.cheapTest);
  const [prompt, setPrompt] = useState(original);
  const [editor, setEditor] = useState(false);
  const [notice, setNotice] = useState('');
  const [manual, setManual] = useState(false);
  const [blocked, setBlocked] = useState<AiProvider | null>(null);
  const fallbackRef = useRef<HTMLTextAreaElement>(null);
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
      setNotice('Промпт скопирован. Вставь его в открывшийся чат');
    } catch {
      setManual(true);
      setNotice('Автокопирование недоступно. Скопируй выделенный текст вручную');
    }
  };
  const openProvider = (provider: AiProvider) => {
    const url =
      provider.supportsPromptPrefill && provider.buildUrl
        ? provider.buildUrl(prompt)
        : provider.url;
    const opened = window.open(url, '_blank', 'noopener,noreferrer');
    setBlocked(opened === null ? provider : null);
    void copy();
  };
  const download = () => {
    const blob = new Blob([resultText(result) + '\n\nПРОМПТ ДЛЯ AI\n' + prompt], {
      type: 'text/plain;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.idea.name || 'idea-result'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="ai-section" aria-labelledby="ask-ai-title">
      <div className="section-kicker">Дополнительная проверка</div>
      <h2 id="ask-ai-title">Спросить AI</h2>
      <p className="lead">
        Передай результаты теста выбранному AI для дополнительной критической оценки идеи.
      </p>
      <div className="provider-grid">
        {aiProviders.map((provider) => (
          <button
            className="provider-card"
            key={provider.id}
            onClick={() => openProvider(provider)}
            aria-label={`Открыть ${provider.name} с готовым промптом`}
          >
            {provider.icon}
            <span>
              <strong>{provider.name}</strong>
              <small>Открыть с готовым промптом</small>
            </span>
            <span aria-hidden="true" className="arrow">
              ↗
            </span>
          </button>
        ))}
      </div>
      <div className="ai-actions">
        <button className="button secondary" onClick={() => void copy()}>
          Скопировать промпт
        </button>
        <button
          className="button ghost"
          onClick={() => setEditor((x) => !x)}
          aria-expanded={editor}
        >
          {editor ? 'Скрыть промпт' : 'Посмотреть промпт'}
        </button>
        <button className="button ghost" onClick={download}>
          Скачать результат как TXT
        </button>
      </div>
      {notice && (
        <div className="toast" role="status">
          {notice}
        </div>
      )}
      {blocked && (
        <div className="inline-alert" role="alert">
          Вкладка могла быть заблокирована.{' '}
          <a href={blocked.url} target="_blank" rel="noopener noreferrer">
            Открыть {blocked.id === 'claude' ? 'Claude' : blocked.name}
          </a>
        </div>
      )}
      {manual && (
        <div className="manual-copy">
          <label htmlFor="manual-prompt">Скопируй выделенный промпт вручную</label>
          <textarea id="manual-prompt" ref={fallbackRef} value={prompt} readOnly rows={8} />
        </div>
      )}
      {editor && (
        <div className="prompt-editor">
          <div className="editor-head">
            <div>
              <h3>Промпт для критической оценки</h3>
              <p>Правки применяются только к копии промпта и не меняют ответы теста.</p>
            </div>
            <button
              className="text-button"
              onClick={() => setPrompt(original)}
              disabled={prompt === original}
            >
              Восстановить исходный
            </button>
          </div>
          <textarea
            aria-label="Редактируемый промпт"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={18}
          />
          <button className="button secondary" onClick={() => void copy()}>
            Скопировать изменённую версию
          </button>
        </div>
      )}
      <p className="ai-warning">
        AI может дать дополнительный взгляд, но его ответ не является доказательством спроса.
        Проверяй выводы через разговоры, заявки, продажи и реальное поведение пользователей.
      </p>
    </section>
  );
}
