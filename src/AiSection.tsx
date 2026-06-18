import { useEffect, useRef, useState } from 'react';
import type { SavedResult } from './types';
import { generatePrompt, resultText } from './logic';
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
  const original = generatePrompt(result.idea, result.answers, result.cheapTest);
  const [prompt, setPrompt] = useState(original);
  const [editor, setEditor] = useState(false);
  const [notice, setNotice] = useState('');
  const [manual, setManual] = useState(false);
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
      setNotice('Промпт скопирован');
    } catch {
      setManual(true);
      setNotice('Автокопирование недоступно. Скопируй выделенный текст вручную');
    }
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
        Открой выбранный сервис — промпт уже будет в поле ввода. Останется нажать Enter.
      </p>
      <div className="provider-grid">
        {aiProviders.map((provider) => (
          <a
            className="provider-card"
            key={provider.id}
            href={provider.buildUrl(prompt)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Открыть ${provider.name} с готовым промптом`}
          >
            <Icon mark={provider.iconMark} />
            <span>
              <strong>{provider.name}</strong>
              <small>Открыть с готовым промптом</small>
            </span>
            <span aria-hidden="true" className="arrow">
              ↗
            </span>
          </a>
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
