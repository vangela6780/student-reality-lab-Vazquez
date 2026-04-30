# SPEC-002: Scrollytelling Update for Student Reality Lab

- Version: 1.0.0
- Status: Implemented
- Owner: Student Reality Lab Team
- Last Updated: 2026-04-30

## 1. Purpose
Add a scrollytelling narrative module inside this repository to present the war-cost story with paced sections, clear transitions, and explicit interpretation boundaries.

## 2. Scope
In scope:
- New static storytelling module under `public/scrollytelling-update/`.
- Homepage with 5 full-screen narrative sections.
- Supporting content page (`why.html`) with lighter interaction.
- Query-parameter return flow between pages.
- Spec/sprint/traceability docs under `docs/`.

Out of scope:
- Rewriting existing Vite app views in `src/`.
- New backend APIs or schema changes.
- Framework migration.

## 3. Functional Requirements

### FR-1: Story Progression
- Module must include 5 sections in sequence: hook, context, evidence, interpretation, action.
- Each section must be independently addressable via anchor IDs.

### FR-2: Navigation
- Top nav must include anchor links for all sections.
- Module must link to supporting content page.

### FR-3: Supporting Content Page
- `why.html` must reuse the module design system.
- Page must include at least 3 explanatory content blocks.

### FR-4: Scroll Interactions
- Elements marked `.reveal` must animate into view using Intersection Observer.
- Fallback mode must show content without animation if observer is unavailable.

### FR-5: Cross-Page Return Flow
- Content page return links must honor `?returnTo=<path-or-anchor>`.
- Return links must default to story start when parameter is absent.

### FR-6: Process Evidence
- Implementation must include sprint and traceability docs in repo.
- Docs must map tasks to FR IDs.

## 4. Technical Constraints
- Stack: HTML, CSS, vanilla JavaScript.
- Location: `public/scrollytelling-update/` only.
- No additional npm dependencies required.

## 5. Non-Functional Requirements
- NFR-1 Maintainability: keep module self-contained in one folder.
- NFR-2 Readability: consistent spacing, typography, and color tokens.
- NFR-3 Accessibility baseline: semantic headings, alt text, keyboard-reachable nav links.

## 6. Directory Contract

```text
/public/scrollytelling-update/
  index.html
  why.html
  /css/styles.css
  /js/scroll.js
  /images/*.svg
/docs/specs/SPEC-002-scrollytelling-update.md
/docs/specs/TRACEABILITY-SPEC-002.md
/docs/sprints/SPRINT-002-scrollytelling-update.md
```

## 7. Acceptance Criteria
- AC-1 Story module loads at `/scrollytelling-update/index.html`.
- AC-2 Five narrative sections render and anchor links navigate correctly.
- AC-3 Content page link + return flow works.
- AC-4 Reveal animations run and fail gracefully without observer support.
- AC-5 Spec, sprint, and traceability docs are committed.
