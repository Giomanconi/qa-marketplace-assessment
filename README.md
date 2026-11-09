# MarketNest: Pre-Release QA Cycle

QA cycle for the **MarketNest** marketplace, run as a pre-release review. The site is the sandbox provided for this assessment; nothing here touches a real shop.

- **System under test:** MarketNest (the sandbox provided for this assessment)
- **Scope:** functional, GDPR/privacy, basic usability, accessibility and security hygiene (the last two are light checks, see [docs/development-notes/09](docs/development-notes/09-exploratory-sessions.md), "Limits of this cycle")
- **Bugs:** tracked as [GitHub Issues](../../issues) and prioritised on the [Project board](https://github.com/users/Giomanconi/projects/8). The board also records the finished work of the cycle as closed tickets with the `task` label

## QA cycle documents

Read in this order:

| # | Document | Purpose |
|---|----------|---------|
| 0 | [Test plan](docs/qa-cycle/00-test-plan.md) | This cycle: scope, environment, milestones, entry and exit criteria, risks |
| 1 | [Test strategy](docs/qa-cycle/01-test-strategy.md) | How we decide: risk order, test basis, severity and priority model, bug policy |
| 3 | [Core test cases](docs/qa-cycle/03-core-test-cases.md) | 13 test cases: 10 prioritised ones (TC-01 to TC-10) and 3 regression cases derived from findings (TC-11 to TC-13), with results |
| 4 | [GDPR test cases](docs/qa-cycle/04-gdpr-test-cases.md) | 9 privacy and data-protection test cases, with results |
| 7 | [Test report](docs/qa-cycle/07-test-report.md) | One page: verdict, execution table, concerns, active P1 and P2 bugs |

The working records behind the cycle (requirements map, charters, workflow, test accounts and session log) are in [development notes](#development-notes), at the end of this page.

Bug reports use the [issue template](.github/ISSUE_TEMPLATE/bug_report.md). Screenshots and HAR/network captures live in [`evidence/`](evidence/) (personal data redacted).

## Approach in one paragraph

The Help Center is the only written specification, so it is treated as the **source of truth for expected behaviour**. Every rule in it is given an ID (`SHIP-1`, `CPN-3`, ...) and tested. Behaviour the Help Center does not define is logged as an **assumption** and either confirmed against common marketplace/e-commerce conventions or raised as a *discrepancy / question* issue rather than a defect. Exploratory testing is session-based, and results are triaged by severity and priority.

## Test data and privacy of the tester

Only throwaway accounts and fictitious data (names, addresses, emails on a reserved/test domain) are used. No real personal data and no real payment card data are entered. Evidence is redacted before being committed.

## Automation

Playwright + TypeScript tests live in [`tests/app/`](tests/app/), one spec per test case (`tc-01-...` to `tc-13-...` and `gdpr-01-...` to `gdpr-09-...`). Every test creates its own users, shop, products and cart through the API, uses the UI only for what the test is about, and deletes what it created. Rules, commands and GDPR notes are in [TEST-DATA.md](TEST-DATA.md).

Needs Node 22 or newer. A full run takes about 15 minutes, because the QA host is slow on purpose.

```bash
cp env/.env.example env/.env.dev    # set APP_URL (the MarketNest sandbox URL); never commit this file
npm install
npx playwright install chromium
SEED_MAIN=0 npx playwright test    # the whole suite, no main account needed
npm run test:smoke                  # the 4 smoke tests
npm run test:api                    # API tests only
npx playwright test tc-11 --project=chromium   # one test case
ROW=random npx playwright test tc-11 tc-12   # one random case of each table (ROW=c: case c)
node scripts/ci-summary.js          # summary of the last run: new failures, known defects, flaky
npm run cleanup:accounts            # delete accounts a crashed run left behind
npm run accounts:report             # table of every test account created (local, gitignored)
```

These commands are for Git Bash, macOS or Linux. In Windows PowerShell, use `Copy-Item` instead of `cp`, and set the variable first: `$env:SEED_MAIN = '0'; npx playwright test`.

`APP_EMAIL` and `APP_PASSWORD` are optional: they are for an account you registered by hand on the site, and only the seed step (`npm run seed:main`) uses it to add sample items for manual exploration. No test depends on it. Without them, always set `SEED_MAIN=0`, otherwise the seed step fails and the browser tests that wait for it are skipped.

**Known defects are expected failures.** Tests that expose a defect assert the *correct* behaviour, and each one calls `test.fail(..., '#<issue> ...')` (or `Observation ...` for the S3 items without an issue, listed in [docs/development-notes/09](docs/development-notes/09-exploratory-sessions.md)). In data tables only the failing cases are marked. So a run is green while only known defects fail (44 tests), and it goes red for two reasons only: a new failure, or a known defect that passed, which means it may be fixed (retest it, remove `test.fail()`, see [docs/development-notes/06](docs/development-notes/06-labels-and-workflow.md)). The double-click defect (#10) is a race: when it doesn't happen, the retry usually reproduces it and the test shows as flaky. A failure that looks like the QA host (a page or API timeout, a dropped connection, a 5xx) is labelled `host failure` in the report and the summary. Rerun it before filing anything.

**Design choices.** Plain TypeScript test data (no Faker or Zod): the app has no OpenAPI document, so API shapes come from live capture. The QA host is slow and fails requests on purpose, so API setup retries on network errors and 5xx, timeouts are named constants, and runs retry an unexpected failure once. No video is recorded; add `video` in `playwright.config.ts` if you need it. The main account in the env file is used only by the additive seed script, never by a test.

## Pipeline

[`qa-pipeline.yml`](.github/workflows/qa-pipeline.yml) runs lint, the type check and then the tests on GitHub Actions. It runs the smoke set on every pull request that changes code or tests (a docs-only change skips it), and the regression only when someone starts it, because every run leaves soft-deleted accounts and shops in the sandbox. It needs one repository secret, `APP_URL` (the sandbox address, which a secret keeps out of the public logs); the suite creates its own users.

| When | Suite | Start it with |
|---|---|---|
| Every pull request | `smoke`: login, session, add to cart, a purchase; should be green | Automatic, or the Actions tab, or the first command below |
| As a regression | `regression`: the whole suite | Actions tab, or the second command below |

```bash
gh workflow run qa-pipeline.yml --ref <branch> -f suite=smoke
```

```bash
gh workflow run qa-pipeline.yml -f suite=regression
```

**Green means nothing new.** Known defects are expected failures (see above), so the regression is green unless something new fails or a known defect passes. The run page shows a summary with the new failures, the known defects that passed, the flaky tests, and the known defects still failing grouped by issue.

Each run keeps two artifacts for 14 days: `playwright-report` (the HTML report, with test passwords, session cookies and the sandbox address removed, and no traces) and `account-log` (the accounts it created, without passwords). Session cookies are also hidden in the run log. A full regression takes about 15 to 25 minutes on GitHub, a smoke run about 2. It retries an unexpected failure once; known defects don't retry, so retries add only a few accounts to the 100 or so each run creates.

**Runs that show it working** (2026-11-09, with known defects marked as expected failures):
- [Smoke](https://github.com/Giomanconi/qa-marketplace-assessment/actions/runs/42551074580): green: login, session, add to cart and a purchase, then the account cleanup.
- [Regression](https://github.com/Giomanconi/qa-marketplace-assessment/actions/runs/42551301391): green in about 12 minutes: 142 passed, 1 skipped (the seed step). Playwright counts the expected failures (the 44 known defects plus `/terms`) as passed; the run page summary lists them by issue, with no new failures and no flaky tests.
- The same suite locally: green, with the `tc-03` refresh test flaky (failed once, passed on retry; see the observation in [docs/development-notes/09](docs/development-notes/09-exploratory-sessions.md)).
- Before known defects were marked, the last red regression had 46 failures: the 44 known ones plus 2 host timeouts.

- **Automatic runs:** the `pull_request` trigger runs the smoke set; a new push cancels the run before it. The `schedule` trigger (a weekly regression) is written in the workflow, commented out; uncomment it to switch it on.
- **Blocking merges:** branch protection needs a public repo or GitHub Pro. Without it the check reports on each pull request but cannot block the merge.
- **No deployment step:** the sandbox is not ours to deploy, so this is CI for the tests, with no CD.

## Status

- [x] Strategy and requirements reviewed
- [x] Exploratory charters: two sessions (C4, C5, C7 and part of C3) run on the rules without results, plus a small-screen look for C9; the other charters are covered by test cases or not run (see [docs/development-notes/09](docs/development-notes/09-exploratory-sessions.md))
- [x] Core and GDPR test cases executed and automated: TC-01 to TC-13 and GDPR-01 to GDPR-09 (a few checks stay manual, listed in [docs/development-notes/09](docs/development-notes/09-exploratory-sessions.md), "Limits of this cycle")
- [x] Every rule of the [requirements map](docs/development-notes/02-requirements-map.md) has a result or says "Not tested"
- [x] Issues filed and triaged (23 defects: #1 to #4, #6 to #16, #18 to #23, #25, #26; 14 task tickets for the finished work: #32 to #45; test accounts logged in [docs/development-notes/08](docs/development-notes/08-test-accounts.md))
- [x] Test report written ([docs/qa-cycle/07-test-report.md](docs/qa-cycle/07-test-report.md)), with the release recommendation

## Development notes

Exploration and working records kept for reference: they show how the cycle was built, and the QA cycle documents cite them.

| # | Note | Purpose |
|---|------|---------|
| 2 | [Requirements map](docs/development-notes/02-requirements-map.md) | Expected behaviour extracted from the site's Help Center, as testable rules with results |
| 5 | [Exploratory charters](docs/development-notes/05-exploratory-charters.md) | The nine time-boxed charters and their status |
| 6 | [Labels and workflow](docs/development-notes/06-labels-and-workflow.md) | Issue labels, lifecycle, how findings are triaged |
| 8 | [Test accounts](docs/development-notes/08-test-accounts.md) | How test accounts are recorded, and the known leftover accounts |
| 9 | [Exploratory session log](docs/development-notes/09-exploratory-sessions.md) | Session results, observations not filed, what works, limits of this cycle, run stability |
