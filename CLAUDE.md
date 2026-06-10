# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

ACT (Agro-regenerative Citrus Tool) is a farmer-facing self-assessment web app for Valencia citrus growers to measure their progress toward regenerative agriculture. Farmers answer a 28-question survey across 10 criteria; the app runs an MCA (Multi-Criteria Analysis) and shows an overall score, radar chart, per-criterion scores, top-3 priority limitations, and specific next steps.

Based on the **Iberian Regenerative Agriculture Criteria 2026** (CREAF / Asociación de Agricultura Regenerativa Ibérica) and two papers:
- Khangura et al. 2023 (sustainability-15-02338) — RA practices and soil health
- Jayasinghe et al. 2023 (sustainability-15-15941) — global RA definitions and assessment

Live site: **https://bombers111.github.io/ACT/**

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

Pure client-side React + Vite app. No backend. Three screens managed by a simple state machine in `App.jsx`:

```
welcome → survey → results → (retake) → welcome
```

### Key data flow

1. `src/data/criteria.json` — **the single source of truth** for everything: MCA weights, level thresholds, all 10 criteria, all 28 questions, and all answer options with scores 1–4.
2. `Survey.jsx` collects answers into a flat object: `{ criterionId_questionId: score }` (e.g. `soil_management_tillage: 3`)
3. `src/utils/mca.js` `runMCA(answers)` processes answers → per-criterion score (normalised 0–100 as `((avg-1)/3)*100`) → weighted overall score → level badge → top-3 weakest criteria
4. `Results.jsx` renders the dashboard using recharts `RadarChart`

### Adjusting the MCA

**Only edit `src/data/criteria.json`** — no React code needs touching for:
- Changing indicator weights → `mcaWeights` (must sum to 1.0)
- Changing level thresholds → `levels`
- Adding / editing questions or answer options → `criteria[].questions`

### Three status levels

| Score | Level |
|-------|-------|
| 0–59 | In Transition (`#e8a838`) |
| 60–79 | Approaching Regenerative (`#8ab545`) |
| 80–100 | Regenerative (`#3a7d44`) |

### Recommendations

`getRecommendations(criterionId, score)` in `mca.js` returns score-banded next-step text for each of the 10 criteria. To update advice, edit the `recs` object in that function.

## GitHub Pages config

`vite.config.js` sets `base: '/ACT/'` — required for assets to load from the subdirectory. Do not remove this.

The `favicon.svg` is at `public/favicon.svg`. All styling is in `src/App.css` (no CSS framework — custom only). Color palette: `#1a3d2b` (dark green header/buttons), `#f5f2ec` (warm off-white background).
