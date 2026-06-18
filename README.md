# Idea Validator

Готовое локальное React-приложение для первичной детерминированной оценки бизнес-идеи. Тест занимает 3–5 минут, сохраняет черновик и историю в `localStorage`, объясняет стоп-факторы и предлагает следующий дешёвый эксперимент.

## Запуск

```bash
npm install
npm run dev
```

Проверки:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

## GitHub Pages

Сайт публикуется автоматически при push в `main`: https://serjo96.github.io/idea-validator/

1. В репозитории: **Settings → Pages → Source: GitHub Actions**
2. Закоммить и запушить изменения в `main`
3. Дождаться успешного workflow **Deploy to GitHub Pages**

## Структура

- `src/questions.ts` — конфигурация вопросов и вариантов ответа.
- `src/logic.ts` — чистые функции скоринга, классификации, рекомендаций и AI-промпта.
- `src/storage.ts` — работа с черновиком и историей в `localStorage`.
- `src/AiSection.tsx` — адаптеры ChatGPT, Claude by Anthropic и Gemini by Google, clipboard/popup fallback, просмотр и редактирование промпта.
- `src/App.tsx` — экраны старта, описания, опроса, результата и истории.
- `src/test` — unit- и component-тесты.

AI-сервисы не встроены в приложение и не получают данные автоматически. Основной сценарий: приложение копирует промпт, синхронно открывает официальный сайт, пользователь вставляет текст сам. Все провайдеры имеют `supportsPromptPrefill: false`; неподтверждённые URL-параметры не используются.
