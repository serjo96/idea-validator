import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AiSection } from '../AiSection';
import type { SavedResult } from '../types';
const answers = Object.fromEntries(
  [
    'user',
    'behavior',
    'pain',
    'urgency',
    'frequency',
    'payment',
    'alternatives',
    'access',
    'evidence',
    'test',
  ].map((id) => [id, 2]),
);
const result: SavedResult = {
  id: 'r1',
  createdAt: '2026-01-01',
  idea: { name: 'Тестовая идея', description: 'Описание', audience: 'Аудитория', interest: '' },
  answers,
  cheapTest: 'Ручная продажа',
  score: 20,
  category: 'Сильная гипотеза для проверки',
};
let writeText: ReturnType<typeof vi.fn>;
beforeEach(() => {
  writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
  vi.spyOn(window, 'open').mockReturnValue({} as Window);
});
describe('Ask AI', () => {
  it('copies prompt and opens the official URL with safe features', async () => {
    fireEvent.click(
      render(<AiSection result={result} />).getByRole('button', { name: /Открыть ChatGPT/ }),
    );
    expect(window.open).toHaveBeenCalledWith(
      'https://chatgpt.com/',
      '_blank',
      'noopener,noreferrer',
    );
    await waitFor(() =>
      expect(writeText).toHaveBeenCalledWith(expect.stringContaining('Тестовая идея')),
    );
    expect(await screen.findByRole('status')).toHaveTextContent('Промпт скопирован');
  });
  it('opens each provider official URL', () => {
    render(<AiSection result={result} />);
    fireEvent.click(screen.getByRole('button', { name: /Открыть Claude/ }));
    fireEvent.click(screen.getByRole('button', { name: /Открыть Gemini/ }));
    expect(window.open).toHaveBeenNthCalledWith(
      1,
      'https://claude.ai/',
      '_blank',
      'noopener,noreferrer',
    );
    expect(window.open).toHaveBeenNthCalledWith(
      2,
      'https://gemini.google.com/',
      '_blank',
      'noopener,noreferrer',
    );
  });
  it('shows selectable fallback when clipboard fails', async () => {
    writeText.mockRejectedValue(new Error('no'));
    render(<AiSection result={result} />);
    fireEvent.click(screen.getByRole('button', { name: 'Скопировать промпт' }));
    const fallback = await screen.findByLabelText('Скопируй выделенный промпт вручную');
    expect((fallback as HTMLTextAreaElement).value).toContain('Тестовая идея');
  });
  it('shows a normal link if the popup is blocked', () => {
    vi.mocked(window.open).mockReturnValue(null);
    render(<AiSection result={result} />);
    fireEvent.click(screen.getByRole('button', { name: /Открыть Claude/ }));
    expect(screen.getByRole('link', { name: 'Открыть Claude' })).toHaveAttribute(
      'href',
      'https://claude.ai/',
    );
  });
  it('edits only prompt text and resets the original', async () => {
    render(<AiSection result={result} />);
    fireEvent.click(screen.getByRole('button', { name: 'Посмотреть промпт' }));
    const editor = screen.getByLabelText('Редактируемый промпт');
    const original = (editor as HTMLTextAreaElement).value;
    fireEvent.change(editor, { target: { value: 'Моя правка' } });
    expect(result.answers.user).toBe(2);
    fireEvent.click(screen.getByRole('button', { name: 'Скопировать изменённую версию' }));
    await waitFor(() => expect(writeText).toHaveBeenLastCalledWith('Моя правка'));
    fireEvent.click(screen.getByRole('button', { name: 'Восстановить исходный' }));
    expect(editor).toHaveValue(original);
  });
});
