# Target Output — Farmer Self-Assessment Survey

The deliverable for this project is the **farmer-facing survey** at the root URL (`/ACT/`).

The expert weight-elicitation survey (`/ACT/survey`) is a **data-collection tool for the research team only** — it is not the product and should not be confused with the target output.

---

## What the farmer survey must do

1. **Authenticate** the farmer with a simple access code (no account needed).
2. **Collect farm metadata** (name, location, farm size, crop type).
3. **Walk the farmer through 26 questions** across 10 regenerative-agriculture criteria, one question at a time in plain, non-technical language.
4. **Compute an MCA score** (0–100) using weighted criteria and show:
   - Overall score + colour-coded level (In Transition / Approaching Regenerative / Regenerative)
   - Radar chart of the 10 criteria
   - Per-criterion score breakdown
   - Top-3 priority limitations with specific next steps
   - Pass/fail verdict for knockout questions (e.g. synthetic pesticide use)
5. **Support three languages**: English, Spanish (es), Valencian (val).
6. **Save progress** in localStorage so the farmer can resume a draft.
7. **Allow retakes** so the farmer can track improvement over time.

---

## Audience

Valencia citrus growers — not agronomists or researchers. Language must be:
- Simple and practical
- Free of scientific jargon
- Action-oriented (what can I do next?)

---

## User flow

```
auth → welcome → farm metadata → survey (26 questions) → results dashboard
                                                        ↘ retake → welcome
```

---

## What is explicitly out of scope

- The expert survey (`/ACT/survey`) — this exists only to collect criterion weights from professionals and feeds `criteria.json` offline.
- Any backend, login system, or database — the app is fully client-side.
- Crops other than Valencia citrus (for now).

---

## Definition of done

The farmer survey is complete when a citrus grower can:
1. Open the app on a phone or desktop browser.
2. Answer all 26 questions without needing outside help.
3. See a clear score and understand what to improve.
4. Return later and retake the survey to measure progress.
