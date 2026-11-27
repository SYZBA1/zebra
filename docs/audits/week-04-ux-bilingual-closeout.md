# Week 4 — UX and bilingual closeout

**Prepared:** November 28, 2026

## Implemented

- Bilingual Phase 1 selections now retain canonical English option values while presenting Amharic labels, preventing selections from changing or disappearing after a language switch.
- Language switches update the active UI immediately and persist the selected Studio language.
- The active business proposition banner wraps correctly on mobile and keeps its actions usable.
- The business proposition form now loads and updates the latest saved proposition instead of creating duplicate records.
- Language controls in the Phase 1, proposition, Studio, and editor surfaces expose accessible labels and pressed state.

## Verification

- Frontend tests: 8 files passed, 15 tests passed.
- Frontend production build: passed.
- Existing build warnings remain: mixed static/dynamic imports and large bundle chunk warnings.

## Remaining runtime acceptance

- Full browser walkthrough at the agreed mobile and desktop breakpoints.
- Sign-in and live create/edit/save/reopen verification against the deployed API.
- Before/after evidence for both English and Amharic paths.
- Founder/Samuel review and release sign-off.

These runtime checks require a live session and browser access, so they remain release blockers rather than inferred passes.
