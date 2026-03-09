# Presentation Script (STAR)

## S — Situation (20–30 sec)
Students are living through a period where global conflict affects everyday life. Food and energy costs increase, transportation gets more expensive, and public budget tradeoffs can influence school and community resources. The problem is that many students see war as distant headlines, not as something measurable in their daily cost-of-living reality.

## T — Task (10–15 sec)
I asked: what does the data show about military spending, household pressure, and human casualties from 2018 to 2024? The viewer should be able to switch views, compare outcomes, and decide whether the same pattern holds across multiple lenses.

## A — Action (60–90 sec)
I built a four-view narrative web app instead of a random dashboard:

1. Context: frames why students should care.
2. Evidence: interactive chart with metric toggles (CPI vs casualties).
3. Counterpoint: pre-2022 vs post-2021 segmentation to test whether the pattern changes.
4. Takeaway: plain-language conclusion and action for students.

Key data transformation:
- Converted raw CSV into typed `processed.json`.
- Validated year and numeric constraints in TypeScript.
- Computed summary metrics and segmented averages (pre/post-2022).

Interaction choices and why:
- Story tabs force a guided narrative sequence.
- Chart mode toggle isolates one variable at a time, making comparison easier.
- Segmentation cards provide a counterpoint check rather than one flat trend.

Major engineering decisions:
- Used a strict data contract (`ProcessedDataset`) to reduce UI/data mismatch risk.
- Deployed through GitHub Actions Pages workflow for reliable `build/` publishing.
- Used `BASE_URL`-safe data loading to work on GitHub Pages project paths.

## R — Result (60–90 sec)
What the data shows:
- Total military spending in this dataset window is about $5,781B.
- Total estimated casualties are about 1,325,000.

What changes when you interact:
- Switching CPI vs casualties changes the outcome lens, but both views still rise in high-spend years.
- Segmentation (pre-2022 vs post-2021) shows the relationship intensifies after the inflection period.

One limitation (honesty point):
- This analysis is correlational, not causal. It cannot prove military spending alone causes inflation or casualty shifts without additional control variables and broader regional coverage.
