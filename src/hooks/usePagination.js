import { useCallback, useState } from 'react';
import usePersistentState from './usePersistentState';

const isPositiveInteger = (value) => Number.isInteger(value) && value >= 1;

/**
 * Client-side pagination.
 * Goes back to page 1 whenever `resetKey` changes (e.g. search, filters, or sort changed)
 * or the page size changes. A restored page larger than the page count shows the last page.
 * `pageStorageKey` / `pageSizeStorageKey` (optional) remember the page / page size in localStorage.
 */
export default function usePagination(
  rows,
  {
    defaultPageSize = 10,
    pageSizeOptions = [defaultPageSize],
    resetKey = '',
    pageStorageKey,
    pageSizeStorageKey,
  } = {}
) {
  const [page, setPage] = usePersistentState(pageStorageKey, 1, isPositiveInteger);
  const [pageSize, setPageSizeState] = usePersistentState(
    pageSizeStorageKey,
    defaultPageSize,
    (stored) => pageSizeOptions.includes(stored)
  );
  const [lastResetKey, setLastResetKey] = useState(resetKey);

  if (resetKey !== lastResetKey) {
    setLastResetKey(resetKey);
    setPage(1);
  }

  const setPageSize = useCallback(
    (size) => {
      setPageSizeState(size);
      setPage(1);
    },
    [setPageSizeState, setPage]
  );

  const total = rows.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, pageCount);
  const startIndex = (currentPage - 1) * pageSize;
  const pageRows = rows.slice(startIndex, startIndex + pageSize);

  return {
    page: currentPage,
    pageSize,
    pageCount,
    total,
    pageRows,
    setPage,
    setPageSize,
  };
}
