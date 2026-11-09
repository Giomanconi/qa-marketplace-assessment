# 6. Labels and Workflow

## Labels

| Group | Labels |
|-------|--------|
| Type | `bug`, `gdpr`, `security`, `discrepancy` (Help Center vs. behaviour), `question` (unclear requirement), `ux`, `a11y`, `task` (finished work of the cycle, not a defect) |
| Severity | `S1-critical`, `S2-major`, `S3-minor`, `S4-trivial` |
| Priority | `P1-blocker`, `P2-high`, `P3-normal`, `P4-low` |
| Area | `area:auth`, `area:catalog`, `area:cart`, `area:checkout`, `area:orders`, `area:seller`, `area:account`, `area:privacy`, `area:legal`, `area:reviews` |
| Status (optional) | `needs-info`, `duplicate`, `wontfix` |

Create them with the GitHub CLI (run once in the repo):

```bash
gh label create bug --color d73a4a --force
gh label create gdpr --color 5319e7 --force
gh label create security --color b60205 --force
gh label create discrepancy --color fbca04 --force
gh label create question --color d876e3 --force
gh label create ux --color c5def5 --force
gh label create a11y --color 0e8a16 --force
gh label create task --color 0052cc --force
gh label create S1-critical --color 7f0000 --force
gh label create S2-major --color d93f0b --force
gh label create S3-minor --color fbca04 --force
gh label create S4-trivial --color c2e0c6 --force
gh label create P1-blocker --color 7f0000 --force
gh label create P2-high --color d93f0b --force
gh label create P3-normal --color fbca04 --force
gh label create P4-low --color c2e0c6 --force
for a in auth catalog cart checkout orders seller account privacy legal reviews; do
  gh label create "area:$a" --color 1d76db --force
done
```

## Issue naming

`[Area] Short, specific symptom (expected vs. actual)`

Examples:
- `[Checkout] Free shipping applied when subtotal after WELCOME10 is below $50`
- `[Legal] /terms returns an error page; Terms of Service unreachable`

## Lifecycle

1. **Found** → note in session log, capture evidence immediately.
2. **Reproduce** at least twice, on a clean account if state-related, and note whether it is intermittent.
3. **Isolate:** reduce to the shortest steps; check whether it is UI-only or also visible via the network response.
4. **File** using the template; cite requirement ID(s) from the [requirements map](02-requirements-map.md).
5. **Triage:** assign severity/priority; merge duplicates (same root cause = one issue).
6. **[Project board](https://github.com/users/Giomanconi/projects/8) columns:** `Confirmed` → `Automated (test written)` → `Ready for retest` → `Closed`. An issue with a test marked `test.fail(..., '#<n> ...')` sits in `Automated (test written)`; a confirmed issue without one sits in `Confirmed`. The board's Priority field matches the issue's priority label.
7. **Task tickets:** finished work is recorded on the board with the `task` label, in `Closed`. They have no severity or priority, and each says when the work finished.
8. **Retest** after fix: when a marked test passes, the run goes red and its summary lists it under "Known defects that passed". Retest the issue, remove the `test.fail()` line, check that the regression is green, and move the issue to `Ready for retest`; add a regression test if none exists.

## What goes into an issue and what does not

- One defect per issue; the title says what is wrong, not just where.
- Always include expected result **with source** (Help Center rule, convention, or legal reference).
- Evidence: screenshot or short recording and, when relevant, request/response (redact tokens, emails, names).
- **Do not** file the same root cause several times; list affected places inside a single issue.
- **Do not** include real personal data or real card data in any issue.
- Unclear requirement? File as `question` / `discrepancy`, not as a bug.
- Aim for a **small, well-evidenced set** (23 in this cycle, merged by root cause). Notes of lower-value observations stay in the [session log](09-exploratory-sessions.md), under "Observations not filed".

## Prioritisation for interview discussion

For each filed issue, be ready to explain:

1. How it was found and the exact reproduction.
2. The expected behaviour and its source.
3. Severity vs. priority and why they differ (if they do).
4. Likely root cause (hypothesis: UI, API validation, calculation rounding, authorisation).
5. How it would be automated (UI or API test) and at what level.
6. Risk if released.
