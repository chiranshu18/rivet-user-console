import { useCallback } from 'react';
import usePersistentState from './usePersistentState';

const UNSORTED = { key: null, direction: null };

/**
 * 3-state column sort: ascending → descending → none (original order).
 * Clicking a different column starts it at ascending.
 * With `storageKey`, the sort is remembered in localStorage; only `sortableKeys` are restored.
 * @param {{ storageKey?: string, sortableKeys?: string[] }} [options]
 */
export default function useSort({ storageKey, sortableKeys = [] } = {}) {
  const [sort, setSort] = usePersistentState(
    storageKey,
    UNSORTED,
    (stored) =>
      (stored?.key === null && stored?.direction === null) ||
      (sortableKeys.includes(stored?.key) && ['asc', 'desc'].includes(stored?.direction))
  );

  const toggleSort = useCallback(
    (key) => {
      setSort((prev) => {
        if (prev.key !== key) return { key, direction: 'asc' };
        if (prev.direction === 'asc') return { key, direction: 'desc' };
        return UNSORTED;
      });
    },
    [setSort]
  );

  return { sort, toggleSort };
}
