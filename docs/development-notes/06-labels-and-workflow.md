# 6. Labels and Workflow

How findings become issues and move across the [Project board](https://github.com/users/Giomanconi/projects/8).

## Labels

| Group | Labels |
|-------|--------|
| Type | `bug`, `gdpr`, `security`, `discrepancy` (Help Center against behaviour), `question` (unclear requirement), `ux`, `a11y`, `task` (finished work of the cycle) |
| Severity | `S1-critical`, `S2-major`, `S3-minor`, `S4-trivial` |
| Priority | `P1-blocker`, `P2-high`, `P3-normal`, `P4-low` |
| Area | `area:auth`, `area:catalog`, `area:cart`, `area:checkout`, `area:orders`, `area:seller`, `area:account`, `area:privacy`, `area:legal`, `area:reviews` |
| Status (optional) | `needs-info`, `duplicate`, `wontfix` |

They were created once with `gh label create <name> --color <hex> --force`. Severity and priority are defined in the [strategy](../qa-cycle/01-test-strategy.md).

**Title:** `[Core or GDPR][Area] Specific symptom (expected against actual)`. `[GDPR]` marks the issues labelled `gdpr` (and the GDPR task ticket), `[Core]` everything else, so the two lists separate at a glance. For example `[Core][Checkout] Express shipping charged $14.99 instead of $9.99` or `[GDPR][Legal] /terms returns 404; Terms of Service unreachable`.

## Lifecycle

1. **Found:** note it and capture evidence at once.
2. **Reproduce** at least twice, on a clean account if it depends on state; note if it is intermittent.
3. **Isolate:** the shortest steps; UI only, or also in the network response?
4. **File** with the [issue template](../../.github/ISSUE_TEMPLATE/bug_report.md), citing the rule ID from the [requirements map](02-requirements-map.md).
5. **Triage:** severity and priority; one root cause is one issue.
6. **Board:** `Confirmed` → `Automated (test written)` → `Ready for retest` → `Closed`. An issue with a test marked `test.fail(..., '#<n> ...')` is in `Automated`; a confirmed issue without one is in `Confirmed`. The board's Priority matches the label.
7. **Task tickets:** finished work of the cycle, labelled `task`, in `Closed`, with no severity or priority.
8. **Retest after a fix:** the marked test passes, so the run goes red and lists it under "Known defects that passed". Retest, remove `test.fail()`, confirm the regression is green, and move the issue to `Ready for retest`.

## What goes into an issue

- One defect per issue; the title says what is wrong, not only where.
- The expected result **with its source**: a Help Center rule, a convention or a legal reference.
- Evidence: a screenshot and, when useful, the request and response, with tokens and personal data removed. Never real personal or card data.
- Affected places are listed inside one issue, not filed again.
- An unclear requirement is a `question` or `discrepancy`, not a bug.
- A small, well-evidenced set: 23 issues in this cycle. Lower-value findings stay in the [observations not filed](09-exploratory-sessions.md#observations-not-filed).
