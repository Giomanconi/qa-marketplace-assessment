/**
 * Chooses which cases of a data table run, from the ROW variable:
 * - unset or `all`: every case (the default);
 * - `random`: one case, the same in every worker (ROW_SEED is set once in
 *   playwright.config.ts);
 * - a case id such as `c`: that case only.
 *
 * @param {readonly T[]} rows - The cases of the table.
 * @returns {readonly T[]} The cases to run.
 */
export function selectRows<T extends { id: string }>(
    rows: readonly T[]
): readonly T[] {
    const choice = process.env.ROW ?? 'all';
    if (choice === 'all') return rows;
    if (choice === 'random') {
        const seed = Number(process.env.ROW_SEED ?? 0);
        return [rows[seed % rows.length]];
    }
    const chosen = rows.filter((row) => row.id === choice);
    if (chosen.length === 0) {
        throw new Error(
            `ROW=${choice} is not a case of this table. Use all, random or one of: ${rows.map((row) => row.id).join(', ')}`
        );
    }
    return chosen;
}
