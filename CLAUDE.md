# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

ACT (Agro-regenerative Citrus Tool) is a farmer-facing self-assessment web app for Valencia citrus growers to measure their progress toward regenerative agriculture. Farmers answer a 26-question survey across 10 criteria; the app runs an MCA (Multi-Criteria Analysis) and shows an overall score, radar chart, per-criterion scores, top-3 priority limitations, and specific next steps.

Based on the **Iberian Regenerative Agriculture Criteria 2026** (CREAF / Asociación de Agricultura Regenerativa Ibérica) and two papers:
- Khangura et al. 2023 (sustainability-15-02338) — RA practices and soil health
- Jayasinghe et al. 2023 (sustainability-15-15941) — global RA definitions and assessment

Live site: **https://bombers111.github.io/ACT/**
Expert survey: **https://bombers111.github.io/ACT/survey**

## Commands

```bash
npm install       # install dependencies
npm run dev       # local dev server (http://localhost:5173/ACT/)
npm run build     # production build → dist/
npm run preview   # preview the built dist/
npm run lint      # ESLint check
```

Deployment is automatic via GitHub Actions on push to `main` (see `.github/workflows/deploy.yml`). No manual deploy needed.

## Architecture

Pure client-side React + Vite app. No backend. The farmer survey uses a simple state machine in `App.jsx`:

```
auth → welcome → farm metadata → survey → results → (retake) → welcome
                                                   → dashboard
```

A separate expert survey lives at `/ACT/survey` via React Router (`src/main.jsx`).

### Key files

| File | Purpose |
|------|---------|
| `src/data/criteria.json` | Single source of truth: MCA weights, levels, knockouts, 10 criteria, 26 questions |
| `src/data/criteria_es.json` | Spanish translation of criteria/questions |
| `src/data/criteria_val.json` | Valencian translation of criteria/questions |
| `src/data/explanations.json` | Per-answer "why this matters" text shown in survey |
| `src/data/criteriaDefinitions.json` | Official CREAF criterion definitions (used in docs) |
| `src/data/surveyConfig.json` | Expert survey config: domains, section text |
| `src/utils/mca.js` | MCA scoring + recommendations |
| `src/utils/eligibility.js` | Pass/fail knockout computation |
| `src/utils/storage.js` | localStorage draft/results helpers |
| `src/components/Survey.jsx` | Farmer survey component |
| `src/components/Results.jsx` | Results dashboard (radar chart, scores, verdict) |
| `src/pages/ExpertSurvey.jsx` | Expert weight-elicitation survey |
| `src/pages/SurveyComplete.jsx` | Expert survey thank-you page |
| `src/utils/surveySubmit.js` | Submits expert survey to Google Apps Script endpoint |
| `scripts/analyzeWeights.js` | Offline script: reads responses.csv → outputs mcaWeights |

## Scoring system

### 1. Question scale: 1–3
Each question has 3 options scored 1 (conventional), 2 (transitioning), 3 (regenerative).

### 2. Per-criterion score: 0–100
```
score = ((average_of_question_scores - 1) / 2) × 100
```
All 1s → 0, all 2s → 50, all 3s → 100.

### 3. Overall score: weighted MCA
```
overall = Σ (criterion_score × mcaWeight)
```
Weights are in `criteria.json → mcaWeights` and must sum to 1.0.

### 4. Three levels
| Score | Level | Colour |
|-------|-------|--------|
| 0–59 | In Transition | `#e8a838` |
| 60–79 | Approaching Regenerative | `#8ab545` |
| 80–100 | Regenerative | `#3a7d44` |

### 5. Pass/fail eligibility (independent of score)
Knockout questions are Yes/No questions embedded in the survey (e.g. "Does the farm use synthetic pesticides?"). Failing a knockout shows an amber ✗ verdict on the results screen regardless of MCA score. Defined in `criteria.json → knockouts`. Add knockouts there — no code changes needed.

## The 10 criteria

| ID | Title | Weight |
|----|-------|--------|
| contextuality | Contextuality | 0.064 |
| water | Water | 0.106 |
| biodiversity | Biodiversity | 0.106 |
| soil_management | No-till & Soil Management | 0.106 |
| soil_nutrition | Soil Cover & Nutrition | 0.106 |
| crop_diversification | Crops & Diversification | 0.085 |
| plant_health_inputs | Plant Health & Inputs | 0.128 |
| plastics_waste | Plastics & Waste | 0.064 |
| social_foundations | Social Foundations | 0.064 |
| soil_health | Soil Health (outcome) | 0.171 |

## Expert survey

Separate React Router route at `/ACT/survey`. Three sections:
1. Expert profile (domain, years experience, Valencia familiarity)
2. Rate each criterion 1–10 independently (no sum constraint)
3. Free text: suggest missing criteria (each with importance weight) + other comments

Submissions go to Google Apps Script → Google Sheets via FormData POST with `no-cors`.
Endpoint set via `VITE_SURVEY_ENDPOINT` GitHub Actions secret (build-time env var).

To update MCA weights from collected responses:
1. Export Google Sheet as CSV → save as `scripts/responses.csv`
2. Run `node scripts/analyzeWeights.js`
3. Paste output into `criteria.json → mcaWeights`
4. Push to GitHub

## Adjusting the MCA

**Only edit `src/data/criteria.json`** — no React code needed for:
- Changing criterion weights → `mcaWeights` (must sum to 1.0)
- Changing level thresholds → `levels`
- Adding/editing questions or answers → `criteria[].questions`
- Adding knockout questions → `knockouts` array

## GitHub Pages config

`vite.config.js` sets `base: '/ACT/'` — required for assets. Do not remove.

SPA routing fix: `.github/workflows/deploy.yml` copies `dist/index.html` to `dist/404.html` so direct URL access to `/ACT/survey` works on GitHub Pages.

All styling is in `src/App.css` (no CSS framework). Colour palette: `#1a3d2b` (dark green), `#f5f2ec` (warm off-white). Expert survey styles use `es-` prefix to avoid conflicts.
