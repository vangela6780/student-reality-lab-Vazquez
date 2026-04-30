# SPRINT-002: Scrollytelling Module Update

- Parent Spec: `SPEC-002-scrollytelling-update.md`
- Status: Completed
- Target Outcome: Ship a self-contained scrollytelling module inside this repo with method evidence.

## 1. Scope
Deliver a static storytelling module under `public/scrollytelling-update` and align documentation to spec-first process.

## 2. Task Plan

## Phase 1: Module Scaffold
- [x] T1.1 Create `public/scrollytelling-update/` folder structure.
- [x] T1.2 Add homepage with 5 narrative sections.
- [x] T1.3 Add supporting `why.html` page.

Traceability:
- T1.1 -> FR-1, FR-2
- T1.2 -> FR-1, FR-2
- T1.3 -> FR-3

## Phase 2: Interaction and Styling
- [x] T2.1 Add shared design system CSS.
- [x] T2.2 Add reveal animation logic using Intersection Observer.
- [x] T2.3 Add return-link handling via `returnTo` query parameter.

Traceability:
- T2.1 -> NFR-2, NFR-3
- T2.2 -> FR-4
- T2.3 -> FR-5

## Phase 3: Documentation and Verification
- [x] T3.1 Add SPEC-002 document.
- [x] T3.2 Add TRACEABILITY-SPEC-002 matrix.
- [x] T3.3 Update README with module URLs.

Traceability:
- T3.1 -> FR-6
- T3.2 -> FR-6
- T3.3 -> AC-1, AC-5

## 3. Exit Criteria
- [x] All sprint tasks completed.
- [x] AC-1..AC-5 satisfied.
- [x] No cross-repo edits performed.

## 4. Verification Checklist
- [x] Open `public/scrollytelling-update/index.html` and confirm 5 sections.
- [x] Navigate to `why.html` and back to `index.html#slide-1`.
- [x] Confirm `.reveal` elements transition into view.
- [x] Confirm docs created in `docs/specs` and `docs/sprints`.
