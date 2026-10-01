import { useCallback, useState } from 'react';

/**
 * Client-side pagination.
 * Goes back to page 1 whenever `resetKey` changes (e.g. search, filters, or sort changed)
 * or the page size changes.
 */
export default function usePagination(rows, { defaultPageSize = 10, resetKey = '' } = {}) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(defaultPageSize);
  const [lastResetKey, setLastResetKey] = useState(resetKey);

  if (resetKey !== lastResetKey) {
    setLastResetKey(resetKey);
    setPage(1);
  }

  const setPageSize = useCallback((size) => {
    setPageSizeState(size);
    setPage(1);
  }, []);

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
