# Data Notes

## Origin
- This Phase 1 starter CSV is a **compiled classroom dataset** based on:
  - SIPRI Military Expenditure Database (U.S. annual military spend)
  - BLS CPI datasets (food and energy pressure context)
  - Brown University Costs of War (human-cost context)

## Retrieval Metadata
- Retrieved: 2026-03-09
- Compiled by: Student Reality Lab project setup

## Caveats
- `Casualties_Est` combines direct and indirect conflict impacts and should be treated as an estimate.
- `CPI_Food_Energy_Index` is a derived classroom index for communication; verify exact CPI series choices before final publication.
- `Edu_Funding_Gap_Billions` is a project proxy used to explain opportunity cost to student audiences.

## Suggested Verification Before Final Submission
- Replace any proxy values with exact values from your instructor-approved source list.
- Add source URLs per row in a separate column if your class requires cell-level provenance.
- Keep a versioned copy of the raw extract before transformations.

## Import Instructions (Google Sheets/Excel)
1. Open Sheets or Excel.
2. Import `raw.csv` as comma-separated values.
3. Build a combo chart with `Year` on the x-axis.
4. Use `Mil_Spend_USD_Billions` as bars and `CPI_Food_Energy_Index` as a line.
5. Optionally add `Casualties_Est` on a secondary axis.
