// Writes a short results summary from Playwright's JSON report: to the GitHub
// run page in CI ($GITHUB_STEP_SUMMARY), or to the console locally.
//
// Known defects are the tests marked with test.fail('#<issue> ...'), so the
// list of known failures lives in the specs and never needs a second copy.
//
// Usage: node scripts/ci-summary.js [reports/results.json]
const fs = require('node:fs');

const file = process.argv[2] || 'reports/results.json';
const repo = process.env.GITHUB_REPOSITORY;

// The sandbox host, so it never reaches the run page (failed page loads name the URL).
let host = '';
try {
    host = new URL(process.env.APP_URL || '').host;
} catch {
    host = '';
}

function clean(text) {
    let out = String(text || '')
        .replace(/\u001b\[[0-9;]*m/g, '')
        .replace(/Pw-[0-9a-f]{16}-Aa1!/g, '***')
        .replace(/mp_session=[^;\s"']+/g, 'mp_session=***');
    if (host)
        out = out
            .split('https://' + host)
            .join('<sandbox>')
            .split(host)
            .join('<sandbox>');
    return out.replace(/</g, '&lt;');
}

function firstLine(text) {
    const line =
        clean(text)
            .split('\n')
            .find((l) => l.trim()) || '';
    return line.trim().slice(0, 200);
}

function issueLink(description) {
    const match = /^#(\d+)\b(.*)$/.exec(description);
    if (!match || !repo) return description;
    return `[#${match[1]}](https://github.com/${repo}/issues/${match[1]})${match[2]}`;
}

function collect(report) {
    const tests = [];
    const walk = (suite, titles) => {
        for (const child of suite.suites || [])
            walk(child, titles.concat(child.title));
        for (const spec of suite.specs || []) {
            for (const test of spec.tests) {
                const results = test.results || [];
                const annotations = [
                    ...(test.annotations || []),
                    ...results.flatMap((r) => r.annotations || []),
                ];
                const failedAttempt = results.find(
                    (r) => r.status !== 'passed' && r.status !== 'skipped'
                );
                tests.push({
                    name: titles.concat(spec.title).filter(Boolean).join(' › '),
                    status: test.status,
                    expectedStatus: test.expectedStatus,
                    defect:
                        (annotations.find((a) => a.type === 'fail') || {})
                            .description || 'Known defect',
                    host: annotations.some((a) => a.type === 'host failure'),
                    // The JSON report repeats run-time annotations, so dedupe.
                    cleanup: [
                        ...new Set(
                            annotations
                                .filter((a) => a.type === 'cleanup failed')
                                .map((a) => clean(a.description))
                        ),
                    ],
                    error: failedAttempt
                        ? firstLine((failedAttempt.error || {}).message)
                        : '',
                });
            }
        }
    };
    for (const suite of report.suites || [])
        walk(suite, [suite.title.split(/[\\/]/).pop()]);
    return tests;
}

function summarize(tests) {
    const knownFailing = tests.filter(
        (t) => t.status === 'expected' && t.expectedStatus === 'failed'
    );
    const passed = tests.filter(
        (t) => t.status === 'expected' && t.expectedStatus !== 'failed'
    );
    const flaky = tests.filter((t) => t.status === 'flaky');
    const knownPassed = tests.filter(
        (t) => t.status === 'unexpected' && t.expectedStatus === 'failed'
    );
    const newFailures = tests.filter(
        (t) => t.status === 'unexpected' && t.expectedStatus !== 'failed'
    );
    const skipped = tests.filter((t) => t.status === 'skipped');
    const cleanupFailures = tests.flatMap((t) =>
        t.cleanup.map((what) => `- ${t.name}: ${what}`)
    );

    const out = ['## Playwright results', ''];
    if (newFailures.length || knownPassed.length) {
        out.push(
            `**Needs a look:** ${newFailures.length} new failure(s), ${knownPassed.length} known defect(s) that passed.`
        );
    } else {
        out.push('**No new problems:** every failure is a known defect.');
    }
    out.push(
        '',
        '| Result | Tests |',
        '|---|---|',
        `| Passed | ${passed.length} |`,
        `| Known defects, still failing (expected) | ${knownFailing.length} |`,
        `| Flaky (failed, then passed on retry) | ${flaky.length} |`,
        `| New failures | ${newFailures.length} |`,
        `| Known defects that passed | ${knownPassed.length} |`,
        `| Skipped | ${skipped.length} |`,
        ''
    );

    const line = (t) => {
        const label = t.host ? ' **(host failure?)**' : '';
        return `- ${t.name}${label}${t.error ? `: ${t.error}` : ''}`;
    };
    if (newFailures.length) {
        out.push(
            '### New failures',
            'Not a known defect. Rerun it twice, then file it if it repeats.',
            '',
            ...newFailures.map(line),
            ''
        );
    }
    if (knownPassed.length) {
        out.push(
            '### Known defects that passed',
            'Retest the issue; if it is fixed, remove test.fail() and move the issue to Ready for retest.',
            '',
            ...knownPassed.map((t) => `- ${t.name}: ${issueLink(t.defect)}`),
            ''
        );
    }
    if (cleanupFailures.length) {
        out.push(
            '### Cleanup failures',
            'The test result stands. Accounts left behind are deleted by the cleanup step at the end; a product left behind stays listed.',
            '',
            ...cleanupFailures,
            ''
        );
    }
    if (flaky.length) {
        out.push(
            '### Flaky',
            'Failed once, then passed on retry. Usually the QA host.',
            '',
            ...flaky.map(line),
            ''
        );
    }
    if (knownFailing.length) {
        // One line per issue (its first reason), or per observation.
        const groups = new Map();
        for (const t of knownFailing) {
            const key = (/^#\d+\b/.exec(t.defect) || [t.defect])[0];
            const group = groups.get(key) || { defect: t.defect, count: 0 };
            group.count++;
            groups.set(key, group);
        }
        out.push(
            `<details><summary>Known defects still failing (${knownFailing.length} tests, ${groups.size} issues or observations)</summary>`,
            '',
            ...[...groups.values()].map(
                ({ defect, count }) =>
                    `- ${issueLink(defect)} (${count} test${count > 1 ? 's' : ''})`
            ),
            '',
            '</details>',
            ''
        );
    }
    return out.join('\n');
}

if (!fs.existsSync(file)) {
    console.log(`No results file at ${file}`);
    process.exit(0);
}
const markdown = summarize(collect(JSON.parse(fs.readFileSync(file, 'utf8'))));
if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, markdown + '\n');
} else {
    console.log(markdown);
}
