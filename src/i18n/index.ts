import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ru from './locales/ru.json';
import en from './locales/en.json';

const LANG_KEY = 'idea-validator-lang';

export const supportedLanguages = ['ru', 'en'] as const;
export type AppLanguage = (typeof supportedLanguages)[number];

export const resolveBrowserLanguage = (): AppLanguage => {
  const candidates = [navigator.language, ...(navigator.languages ?? [])];
  for (const lang of candidates) {
    const base = lang.toLowerCase().split('-')[0];
    if (base === 'en' || base === 'ru') return base;
  }
  return 'ru';
};

export const getInitialLanguage = (): AppLanguage => {
  const stored = localStorage.getItem(LANG_KEY);
  if (stored === 'en' || stored === 'ru') return stored;
  return resolveBrowserLanguage();
};

export const setStoredLanguage = (lang: AppLanguage) => {
  localStorage.setItem(LANG_KEY, lang);
  document.documentElement.lang = lang;
};

void i18n.use(initReactI18next).init({
  resources: {
    ru: { translation: ru },
    en: { translation: en },
  },
  lng: getInitialLanguage(),
  fallbackLng: 'ru',
  interpolation: { escapeValue: false },
});

document.documentElement.lang = i18n.language;

export default i18n;
