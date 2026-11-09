// Reads the gitignored account log (.auth/account-registry.jsonl) and writes a
// readable table to .auth/account-registry.md (also printed).
// Run: npm run accounts:report
// The table shows the synthetic password; keep the .auth folder out of git.
// With --no-passwords it leaves the passwords out and writes reports/account-log.md,
// which is safe to publish as a CI artifact.
const fs = require('node:fs');
const path = require('node:path');

const withPasswords = !process.argv.includes('--no-passwords');
const logFile = path.join('.auth', 'account-registry.jsonl');
const outFile = withPasswords
    ? path.join('.auth', 'account-registry.md')
    : path.join('reports', 'account-log.md');

if (!fs.existsSync(logFile)) {
    console.log('No account log yet (' + logFile + ').');
    process.exit(0);
}

const accounts = new Map();
for (const line of fs.readFileSync(logFile, 'utf-8').split('\n')) {
    if (!line.trim()) continue;
    const entry = JSON.parse(line);
    const row = accounts.get(entry.email) || {
        email: entry.email,
        password: entry.password,
        created: '',
        deleted: '',
        note: entry.note || '',
    };
    if (entry.event === 'created') row.created = entry.at;
    if (entry.event === 'deleted') row.deleted = entry.at;
    // Announced by a test but the app never created it: nothing to report.
    if (entry.event === 'not-created') {
        accounts.delete(entry.email);
        continue;
    }
    if (entry.note) row.note = entry.note;
    accounts.set(entry.email, row);
}

const rows = [...accounts.values()];
const lines = [
    withPasswords ? '# Account registry (local, gitignored)' : '# Account log',
    '',
    'Generated ' + new Date().toISOString() + '. Synthetic data only.',
    'Status "soft-deleted": the app keeps the record, so the email stays taken.',
    '',
    withPasswords
        ? '| Email | Password | Created | Status | Note |'
        : '| Email | Created | Status | Note |',
    withPasswords ? '|---|---|---|---|---|' : '|---|---|---|---|',
    ...rows.map(
        (r) =>
            '| ' +
            r.email +
            ' | ' +
            (withPasswords ? r.password + ' | ' : '') +
            r.created +
            ' | ' +
            (r.deleted ? 'soft-deleted ' + r.deleted : 'ACTIVE (orphan?)') +
            ' | ' +
            r.note +
            ' |'
    ),
];
fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, lines.join('\n') + '\n');
console.log(lines.join('\n'));
