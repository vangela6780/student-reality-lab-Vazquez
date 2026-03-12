# Angela's Midterm Project

## Essential Question (1 sentence)
What is the cost of war to humanity and society?

## Claim (Hypothesis) (1 sentence; can be wrong)
War costs homes, lives, and money; it harms people and ecosystems, and the public should care more about those consequences.

## Audience (who is this for?)
My audience is students and community members who want global context, not only Western media headlines.

## STAR Draft (bullets)
- **S — Situation: Why this matters to students now**
  War-related disruption can raise fuel and food costs, strain public budgets, and increase pressure on tuition, transit, and career planning for students entering adulthood.
- **T — Task: What the viewer should be able to conclude or do**
  The viewer should be able to conclude that war has measurable human and economic costs, and distinguish between direct military costs and social opportunity costs.
- **A — Action: What you will build (views + interaction)**
  I will build an interactive website with linked articles, interviews, research summaries, a gallery, and veteran/civilian testimonials.
- **R — Result: What you expect the data to show; what metric you'll report**
  I expect the data to show that higher military spending years align with higher household pressure indicators (food/energy CPI and education affordability pressure). I will report year-over-year percent change and a simple correlation value.

## Dataset & Provenance (source links + retrieval date + license/usage)
Primary and supporting sources used for this Phase 1 starter dataset:

1. **SIPRI Military Expenditure Database**
   - Link: https://www.sipri.org/databases/milex
   - Field used: U.S. annual military expenditure (current USD, billions)
   - Retrieval date: 2026-03-09
   - Usage: SIPRI terms of use (research/educational analysis; cite source)

2. **U.S. Bureau of Labor Statistics (BLS) CPI**
   - Link: https://www.bls.gov/cpi/
   - Fields used: CPI-U food-related and energy-related series (combined into one classroom index in this project)
   - Retrieval date: 2026-03-09
   - Usage: U.S. government public data (generally public domain)

3. **Costs of War Project (Brown University, Watson Institute)**
   - Link: https://watson.brown.edu/costsofwar/
   - Field used: Conflict death burden context for human-cost layer
   - Retrieval date: 2026-03-09
   - Usage: Educational/non-commercial use with citation (see site terms)

4. **World Bank Data (macro context checks)**
   - Link: https://data.worldbank.org/
   - Retrieval date: 2026-03-09
   - Usage: CC BY-4.0 for World Bank indicators

## Data Dictionary (minimum 5 rows: column -> meaning -> units)

**VERIFIED DATA** (sourced from established databases):
| Column | Meaning | Units | Source | Data Quality |
|---|---|---|---|---|
| Year | Calendar/fiscal reference year | YYYY | Standard | ✓ Complete |
| Mil_Spend_USD_Billions | U.S. military expenditure | Billions of current USD | SIPRI Military Expenditure Database | ✓ Verified, official source |
| CPI_Food_Energy_Index | Combined index tracking food + energy consumer pressure (normalized from BLS CPI series) | Index (unitless; base-year normalized) | U.S. Bureau of Labor Statistics (BLS) | ✓ Verified, public data |
| Casualties_Est | Estimated direct + indirect conflict-related deaths (includes low/high bounds in source literature) | People (count) | Brown University Costs of War; UCDP | ⚠ Estimated; methodology varies by source |

**PROJECT-DERIVED NARRATIVE METRIC** (for student context; not a federal ledger):
| Column | Meaning | Units | Purpose | Caveat |
|---|---|---|---|---|
| Edu_Funding_Gap_Billions | Proxy metric for public narrative about education opportunity cost relative to defense prioritization | Billions of USD | Illustrative; helps students understand "tradeoff" framing | ⚠ **NOT** a federal accounting value; for classroom narrative only; do not cite as policy fact |

## Data Viability Audit
### Missing values + weird fields
- `Casualties_Est` is an estimate and has uncertainty bands in underlying literature; exact annual attribution is difficult.
- CPI is merged into one classroom-friendly `CPI_Food_Energy_Index`; this is a derived field, not a native single BLS series.
- `Edu_Funding_Gap_Billions` is a proxy metric for storytelling and should not be interpreted as a federal accounting ledger value.
- Multi-source rows can create year-boundary mismatch (calendar year vs fiscal year reporting).

### Cleaning plan
- Convert all numeric fields to strict numeric types; strip commas and symbols.
- Keep `Year` as integer and sort ascending.
- Standardize military spend to current USD billions for comparability.
- Document derived-field formulas in `data/notes.md`.
- For missing or delayed casualty estimates, keep nulls and annotate instead of fabricating values.

### What this dataset cannot prove (limits/bias)
**Critical limitations (READ BEFORE DRAWING CONCLUSIONS):**
- **No causal proof**: This dataset does NOT prove military spending *causes* inflation, tuition pressure, or casualty changes. Correlation ≠ causation. Multiple factors (supply chains, geopolitics, pandemic recovery) influence CPI and casualties simultaneously.
- **U.S. military spending ≠ global conflict cost**: This data tracks U.S. defense budgets only, not how that spending is deployed or its actual impact on the regions at war. It's incomplete for understanding full conflict costs.
- **Casualties are estimates with uncertainty**: Different methodologies (direct deaths vs. indirect impact via disease/famine) produce different numbers. The "Casualties_Est" field represents one interpretation; other sources may differ by 20-40%.
- **Student cost-of-living ≠ military spending directly**: Tuition and transportation costs are influenced by many policy choices, not just defense budgets. This data cannot isolate the defense budget's specific role.
- **Time window matters**: 2018-2024 covers a specific geopolitical period. Extending back or forward would change conclusions.
- **CPI proxy**: We combined food + energy CPI into one "classroom index" for simplicity. Real student cost-of-living includes housing, healthcare, and childcare—not just food and energy.

## Draft Chart Screenshot (from Sheets/Excel) + 2 bullets explaining why the chart answers the question
**Screenshot placeholder:** Add your chart image after importing `data/raw.csv` into Sheets or Excel.

Suggested chart setup:
- Chart type: Combo chart (columns for `Mil_Spend_USD_Billions`, line for `CPI_Food_Energy_Index`; optional secondary line for `Casualties_Est` on secondary axis).
- X-axis: `Year`.

Why this chart answers the question:
- It places economic burden (military spending and household price pressure) on one timeline so viewers can see whether peaks move together.
- Adding casualties keeps the human-cost layer visible, preventing the story from becoming only a budget chart.

## Integrated CLI Tools ("functions")
This repository includes a CLI tool engine under `cli/` with commands for research and utility workflows.

### Available CLI commands
- `help` -> list available commands
- `status` -> show engine and plugin status
- `version` -> show CLI version
- `echo <text>` -> echo back text
- `add <a> <b>` -> add two numbers (calculator plugin)
- `subtract <a> <b>` -> subtract two numbers (calculator plugin)
- `multiply <a> <b>` -> multiply two numbers (calculator plugin)
- `search <query> [--output <file>]` -> AI web research (requires `OPENAI_API_KEY`)
- `generate-image <prompt> ...` -> DALL-E image generation (requires `OPENAI_API_KEY`)
- `analyze-website <url> ...` -> screenshot + Gemini analysis (requires `GEMINI_API_KEY`)

### CLI Setup
1. Install dependencies: `npm install`
2. Create env file: copy `.env.example` to `.env` and add keys
3. Run CLI commands:
   - `npm run cli:help`
   - `npm run cli:status`
   - `node cli/index.js multiply 250 3`

### Reliability note
The CLI starts even if AI keys are missing. AI-only plugins are skipped with warnings until keys are configured.

---

## Phase 2: Data Pipeline + Contract

### Cleaning & Transform Notes

**Raw → Processed Pipeline:**
1. **Input:** `data/raw.csv` (7 rows, 2018–2024)
2. **Parser:** `src/lib/loadData.ts` → `parseRawCSV()` handles quoted CSV fields and type conversion
3. **Validation:** Each row is validated against `src/lib/schema.ts` constraints:
   - Year must be 2000–2030
   - All numeric fields must be positive (except casualties ≥ 0)
   - Invalid rows are logged and skipped
4. **Transform:** `transformToProcessed()` generates metadata + summary statistics
5. **Output:** `data/processed.json` (typed, validated, ready for UI consumption)

**Data Quality Checks:**
- No missing values in current dataset
- All years sequential and ascending
- No anomalies detected (no >50% year-over-year jumps)
- Caution: Casualties are estimates (see provenance notes)
- Caution: CPI is a derived index, not a single BLS series

**Run the pipeline:**
```bash
npm run process-data
```

This regenerates `data/processed.json` from `data/raw.csv` with full validation and summary stats.

### Definitions (Key Terms)

**Military Spending (Mil_Spend_USD_Billions)**  
Total U.S. annual military expenditure in billions of current USD. Includes defense budget, operations, and procurement. Source: SIPRI.

**CPI Food & Energy Index (CPI_Food_Energy_Index)**  
A classroom-friendly combined index tracking consumer price pressure for food and energy. Derived from BLS CPI-U series. Higher values = higher cost of living.

**Education Funding Gap (Edu_Funding_Gap_Billions)**  
An *opportunity cost proxy* representing the narrative tension between defense spending and education investment. **Not** a literal federal budget line item. Used to communicate trade-offs to student audiences.

**Casualties Estimate (Casualties_Est)**  
Estimated total conflict-related deaths (direct + indirect) for context. Numbers are modeled from Brown University Costs of War research and carry methodological uncertainty.

**Processed Dataset**  
The output of our data pipeline (`data/processed.json`). A typed, validated JSON structure with:
- `metadata`: processing timestamp, record counts, year range, quality flags
- `data`: array of validated data points
- `summary`: aggregate statistics (total spend, avg CPI growth, total casualties)

**Data Contract**  
The TypeScript interface (`ProcessedDataset` in `src/lib/schema.ts`) that guarantees the shape of data flowing into the UI. Frontend code can trust this contract without re-validating.

### Phase 2 Engineering Acceptance

**Build Commands Work:**
```bash
npm run dev          # Launches Vite dev server at http://localhost:5173
npm run build        # Compiles TypeScript, bundles with Vite → build/
npm run process-data # Regenerates data/processed.json from raw CSV
```

**No Magic Numbers:**  
All constants are named and documented in `src/lib/schema.ts`:
- `CPI_BASE_YEAR = 2018`
- `MIN_VALID_YEAR = 2000`
- `MAX_VALID_YEAR = 2030`
- `ANOMALY_THRESHOLD_PCT = 50`

**Type Safety:**  
Full TypeScript contracts prevent runtime errors. Schema validation at build time ensures data integrity before it reaches the browser.

---

## Phase 4: Full Story (2-4 Views + STAR Narrative)

This app now uses 4 narrative views, each with a specific job:

1. `Context` — frames the student problem and stakes.
2. `Evidence` — interactive chart with toggles (`CPI` vs `Casualties`).
3. `Counterpoint` — segmented comparison (`pre-2022` vs `2022+`) and transparent raw table.
4. `Takeaway` — final claim, caution on causation, and student action.

Required STAR presentation script is included in `PRESENTATION.md`.

---

## Phase 5: Polish + Demo Day

### Accessibility basics
- Semantic labels on major controls and tables.
- Visible keyboard focus states on story tabs and metric toggle buttons.
- High contrast button and text styling.

### Performance basics
- Data is preprocessed at build-time (`data/processed.json`) to avoid heavy parsing in the browser.
- Chart updates are scoped to dataset/axis changes rather than full page rerenders.

### Limits & What I'd Do Next

**Current limits:**
- Correlation does not prove causation.
- Casualty values are estimated and methodology-dependent.
- Dataset is short (2018-2024) and U.S.-centered for spending.

**What I'd do next:**
- Add confidence bands and methodology comparisons for casualty estimates.
- Add a broader cross-country panel for stronger segmentation.
- Add statistical controls (energy supply shocks, macro indicators).

### Live demo format (3-5 minutes)
1. State the claim in one sentence.
2. Show interaction by toggling chart modes and switching narrative views.
3. Cite one limitation clearly.
4. End with one actionable takeaway for students.

---

## Submission Checklist

- Repository link
- Deployed link (GitHub Pages)
- 60-second screen recording backup

## AI Chat API Setup (No Frontend Fallback)

Quick start (recommended):

```bash
npm.cmd install
npm.cmd run dev:all
```

This launches both the Vite site and the Next.js chat API together.

To use real chat responses in the website AI panel, run both apps locally:

1. Start the Next API backend:
```bash
cd ai-orchestration-nextjs
npm.cmd install
copy .env.example .env.local
```
Add your key to `ai-orchestration-nextjs/.env.local`:
```env
OPENAI_API_KEY=your_real_key
```
Then run:
```bash
npm.cmd run dev
```

2. Start this Vite website (second terminal):
```bash
cd ..
npm.cmd run dev
```

Local proxy is configured in `vite.config.ts` so `'/api/chat'` routes to `http://localhost:3000/api/chat` during development.

## GitHub Pages: Make AI Chat Work Online

GitHub Pages is static hosting, so it cannot run the Next.js `/api/chat` backend directly.

To make chat work on the deployed site:

1. Deploy the backend app in `ai-orchestration-nextjs/` to a server host (recommended: Vercel, Render, or Railway).
2. Copy your live backend API URL, for example:
   - `https://your-backend-domain.com/api/chat`
3. In GitHub repository settings, create a repository variable:
   - Name: `VITE_CHAT_API_URL`
   - Value: your full backend `/api/chat` URL
4. Push to `main` again (or rerun the Pages workflow). The build workflow injects this variable automatically.

After deploy, the Pages frontend will call your hosted backend URL for AI chat.
