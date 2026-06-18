import { describe, expect, it, vi } from 'vitest';
import { getInitialLanguage, resolveBrowserLanguage } from '../i18n';

describe('language resolution', () => {
  it('prefers localStorage over browser locale', () => {
    localStorage.setItem('idea-validator-lang', 'en');
    vi.stubGlobal('navigator', { language: 'ru-RU', languages: ['ru-RU'] });
    expect(getInitialLanguage()).toBe('en');
  });

  it('uses browser locale when localStorage is empty', () => {
    localStorage.removeItem('idea-validator-lang');
    vi.stubGlobal('navigator', { language: 'en-US', languages: ['en-US', 'en'] });
    expect(getInitialLanguage()).toBe('en');
  });

  it('falls back to ru for unsupported browser locales', () => {
    vi.stubGlobal('navigator', { language: 'de-DE', languages: ['de-DE'] });
    expect(resolveBrowserLanguage()).toBe('ru');
  });
});
