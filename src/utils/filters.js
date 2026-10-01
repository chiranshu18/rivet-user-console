/**
 * Keeps rows where any of `fields` equals `query` exactly (case-insensitive, trimmed).
 * An empty query keeps all rows.
 */
export function filterByExactSearch(rows, query, fields) {
  const target = query.trim().toLowerCase();
  if (!target) return rows;
  return rows.filter((row) =>
    fields.some((field) => String(row[field] ?? '').toLowerCase() === target)
  );
}

/** Keeps rows whose `key` is one of `selected`. An empty selection keeps all rows. */
export function filterBySelection(rows, key, selected) {
  if (selected.length === 0) return rows;
  const allowed = new Set(selected);
  return rows.filter((row) => allowed.has(row[key]));
}
