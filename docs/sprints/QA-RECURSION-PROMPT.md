# QA Recursion Prompt Template

Use this prompt after any spec or sprint update:

```text
Review SPEC-001 and SPRINT-001 as a paired system.

1) Completeness: Identify missing requirements, assumptions, or unhandled edge cases.
2) Consistency: Verify every sprint task maps to at least one FR/NFR requirement and no task contradicts the spec.
3) Resilience: Validate timeout, offline MCP server, malformed tool payload, and no-tool fallback behavior.
4) Diminishing Returns: Iterate up to 4 passes and stop only when no structural quality improvements remain.

Output format:
- Findings by severity (critical, major, minor)
- Exact document section references
- Proposed edits
- Final verdict: "Aligned" or "Not Aligned"
```
