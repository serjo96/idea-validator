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
  category: 'strongHypothesis',
};

let writeText: ReturnType<typeof vi.fn>;

beforeEach(() => {
  writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
});

describe('Ask AI', () => {
  it('does not copy to clipboard when opening a provider link', () => {
    render(<AiSection result={result} />);
    fireEvent.click(screen.getByRole('link', { name: /Открыть ChatGPT/ }));
    expect(writeText).not.toHaveBeenCalled();
  });

  it('links ChatGPT with encoded prompt in URL', () => {
    render(<AiSection result={result} />);
    const link = screen.getByRole('link', { name: /Открыть ChatGPT/ });
    expect(link).toHaveAttribute('href', expect.stringContaining('https://chatgpt.com/#?q='));
    expect(link.getAttribute('href')).toContain(encodeURIComponent('Тестовая идея'));
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('links Claude and Gemini with prompt query params', () => {
    render(<AiSection result={result} />);
    const claude = screen.getByRole('link', { name: /Открыть Claude/ });
    const gemini = screen.getByRole('link', { name: /Открыть Gemini/ });

    expect(claude.getAttribute('href')).toMatch(/^https:\/\/claude\.ai\/new\?q=/);
    expect(gemini.getAttribute('href')).toMatch(/^https:\/\/gemini\.google\.com\/app\?q=/);
    expect(claude.getAttribute('href')).toContain(encodeURIComponent('Тестовая идея'));
    expect(gemini.getAttribute('href')).toContain(encodeURIComponent('Тестовая идея'));
  });

  it('updates provider links when prompt is edited', () => {
    render(<AiSection result={result} />);
    fireEvent.click(screen.getByRole('button', { name: 'Посмотреть промпт' }));
    fireEvent.change(screen.getByLabelText('Редактируемый промпт'), {
      target: { value: 'Моя правка' },
    });

    expect(screen.getByRole('link', { name: /Открыть ChatGPT/ }).getAttribute('href')).toContain(
      encodeURIComponent('Моя правка'),
    );
  });

  it('shows selectable fallback when clipboard fails', async () => {
    writeText.mockRejectedValue(new Error('no'));
    render(<AiSection result={result} />);
    fireEvent.click(screen.getByRole('button', { name: 'Скопировать промпт' }));
    const fallback = await screen.findByLabelText('Скопируй выделенный промпт вручную');
    expect((fallback as HTMLTextAreaElement).value).toContain('Тестовая идея');
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
