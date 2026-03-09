# Presentation Script (STAR)

## S — Situation (20–30 sec)
You didn't choose to live during a war. But as a student preparing for adulthood, you're feeling its costs in real time: whether it's gas prices you notice, tuition your family discusses, or news headlines that feel closer to home than you'd like. 

The problem is that many students see war as distant headlines, not as something measurable in their daily cost-of-living reality. This project bridges that gap by asking: *When governments spend more on military budgets, do household costs—and human casualties—rise at the same time?* Understanding that correlation helps you prepare for the future and hold policymakers accountable.

## T — Task (10–15 sec)
I asked: what does the data show about military spending, household pressure, and human casualties from 2018 to 2024? The viewer should be able to switch views, compare outcomes, and decide whether the same pattern holds across multiple lenses.

## A — Action (60–90 sec)
I built a four-view narrative web app that guides you through the evidence instead of just dumping data on you:

1. **Context**: Frames the problem in terms you understand—your costs rising, your future at stake.
2. **Evidence**: Interactive chart with metric toggles (CPI vs casualties). Switch views to see if the pattern holds across different outcome lenses.
3. **Counterpoint**: Pre-2022 vs post-2021 segmentation to test whether the relationship changes after a major geopolitical inflection.
4. **Takeaway**: Plain-language conclusion and actionable student takeaway—what this means for *your* decision-making.

**Key data transformation:**
- Converted raw CSV into typed `processed.json` with strict validation.
- Computed summary metrics and segmented averages (pre/post-2022) to quantify how the relationship intensifies.
- Flagged narrative proxies (Edu_Funding_Gap) vs verified data (SIPRI, BLS, UCDP) so you know what's fact-based vs illustrative.

**Why these interaction choices:**
- **Story tabs force guided narrative**: You follow the evidence in sequence, not random exploration.
- **Toggle isolates one variable**: Comparing CPI vs casualties on the same spend axis shows whether the conclusion changes with the metric.
- **Segmentation tests stability**: If pre-2022 and post-2021 move differently, the relationship isn't constant—that matters for your interpretation.

## R — Result (60–90 sec)
**What the data shows:**
- Total military spending in this period: ~$5,781B
- Total estimated conflict casualties: ~1.3 million
- CPI (food + energy) rose 64.3 points from 2018 to 2024
- Post-2022 shift: CPI up 17.3% and casualties up 66.1% compared to pre-2022 averages

**What changes when you interact:**
- Switching from CPI to casualties changes the outcome lens, but both rise sharply in high-spend years.
- Segmentation shows the relationship *intensifies* after 2022—the correlation isn't flat across the entire period.

**What this does NOT prove:**
- Military spending does NOT single-handedly cause inflation. Supply chains, pandemic recovery, energy shocks, and global market forces all influence prices.
- If you see higher CPI and higher spending move together, you're seeing *correlation*, not proof that one caused the other.
- This data is U.S.-focused. It doesn't capture how that spending actually lands in conflict zones or the full global cost of war.

**Why this matters for you as a student:**
This isn't about proving military spending is good or bad—it's about recognizing that *government budget choices are connected to your lived reality*. Whether costs rise because of war-related spending, supply shocks, or geopolitical disruption, understanding those links helps you:
1. **Demand better explanations** from policymakers about how budget priorities affect your future
2. **Literacy for adult decisions**—when you vote, work, or plan your career, you'll understand the stakes
3. **Prepare for uncertainty**—knowing costs correlate with global events helps you plan financially
