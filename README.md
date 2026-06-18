# Idea Validator

A ready-to-run local React app for an initial deterministic assessment of a business idea. The test takes 3–5 minutes, saves drafts and history in `localStorage`, explains stop factors, and suggests the next low-cost experiment.

## Getting Started

```bash
npm install
npm run dev
```

Checks:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

## GitHub Pages

Site: https://serjo96.github.io/idea-validator/

Deployment runs via GitHub Actions on push to `main`.




## Structure

- `src/questions.ts` — question and answer option configuration.
- `src/logic.ts` — pure functions for scoring, classification, recommendations, and the AI prompt.
- `src/storage.ts` — draft and history management in `localStorage`.
- `src/AiSection.tsx` — links to ChatGPT, Claude, and Gemini with the prompt in the URL, copy, view, and edit prompt.
- `src/App.tsx` — start, description, survey, result, and history screens.
- `src/test` — unit and component tests.

AI services are not built into the app. Clicking opens the official site with the prompt in the URL (`?q=`), which is pre-filled in the input field. Press Enter to send the request.
