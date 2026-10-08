# DocBlock

Safety app for medical professionals: log and search warnings about
potentially violent or disruptive patients. Reports are AI-validated and
enriched with up-to-date information through Google Search grounding, so
front-desk and clinical staff see risk context before the encounter.

## What's inside

- `App.tsx`, `components/` (Header plus report / search / withdraw flows:
  `ReportWarning`, `SearchPatient`, `WithdrawWarning`), `context/`,
  `services/geminiService.ts`, `types.ts`, `Font/`.
- GitHub Pages deployment configured
  (`https://K1tvkli.github.io/DocBlock/`, `deploy` script via `gh-pages`).

## Tech stack

React 19, Vite 6, TypeScript, `@google/genai` with Search grounding.
Requires `GEMINI_API_KEY` in a local `.env` file.

## Getting started

```bash
npm install
npm run dev
```

App serves on http://localhost:3000. `npm run build` for production,
`npm run deploy` to publish to GitHub Pages.

## Status

Working single-purpose app (TypeScript).
Because this app handles sensitive safety reports, verify data-retention,
access-control, and report-validation behavior before any use beyond
personal testing.
