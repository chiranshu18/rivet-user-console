import { parseDateTime } from './formatDate';

export function compareNumbers(a, b) {
  return a - b;
}

export function compareDateTimes(a, b) {
  return (parseDateTime(a)?.getTime() ?? 0) - (parseDateTime(b)?.getTime() ?? 0);
}

/** Compares versions like 'v1.10.0' and 'v1.9.2' numerically, part by part. */
export function compareSemver(a, b) {
  const toParts = (version) => String(version).replace(/^v/i, '').split('.').map(Number);
  const partsA = toParts(a);
  const partsB = toParts(b);
  for (let i = 0; i < Math.max(partsA.length, partsB.length); i += 1) {
    const diff = (partsA[i] ?? 0) - (partsB[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

/**
 * Returns a sorted copy of `rows`, or `rows` unchanged when no sort is active.
 * Relies on Array#sort being stable, so ties keep their original (CSV) order.
 * @param {Object[]} rows
 * @param {{ key: string | null, direction: 'asc' | 'desc' | null }} sort
 * @param {Object<string, (a: any, b: any) => number>} comparators keyed by column
 */
export function sortRows(rows, sort, comparators) {
  const compare = comparators[sort.key];
  if (!sort.direction || !compare) return rows;
  const factor = sort.direction === 'asc' ? 1 : -1;
  return [...rows].sort((a, b) => factor * compare(a[sort.key], b[sort.key]));
}
