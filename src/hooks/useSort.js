import { useCallback, useState } from 'react';

const UNSORTED = { key: null, direction: null };

/**
 * 3-state column sort: ascending → descending → none (original order).
 * Clicking a different column starts it at ascending.
 */
export default function useSort() {
  const [sort, setSort] = useState(UNSORTED);

  const toggleSort = useCallback((key) => {
    setSort((prev) => {
      if (prev.key !== key) return { key, direction: 'asc' };
      if (prev.direction === 'asc') return { key, direction: 'desc' };
      return UNSORTED;
    });
  }, []);

  return { sort, toggleSort };
}
