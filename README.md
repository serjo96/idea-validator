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

Сайт: https://serjo96.github.io/idea-validator/

Деплой идёт через GitHub Actions при push в `main`.

**Важно:** в **Settings → Pages** источник должен быть **GitHub Actions**, а не *Deploy from a branch*.  
Если выбрана ветка `main`, на сайт попадёт исходный `index.html` с `/src/main.tsx` — в консоли будет 404.

1. **Settings → Pages → Build and deployment → Source: GitHub Actions**
2. Push в `main` или вручную запустить workflow **Deploy to GitHub Pages**
3. Дождаться зелёной галочки в Actions

## Структура

- `src/questions.ts` — конфигурация вопросов и вариантов ответа.
- `src/logic.ts` — чистые функции скоринга, классификации, рекомендаций и AI-промпта.
- `src/storage.ts` — работа с черновиком и историей в `localStorage`.
- `src/AiSection.tsx` — ссылки на ChatGPT, Claude и Gemini с промптом в URL, копирование, просмотр и редактирование промпта.
- `src/App.tsx` — экраны старта, описания, опроса, результата и истории.
- `src/test` — unit- и component-тесты.

AI-сервисы не встроены в приложение. При клике открывается официальный сайт с промптом в URL (`?q=`), который подставляется в поле ввода. Остаётся нажать Enter и отправить запрос.
