import { useId } from 'react';
import styles from './Pagination.module.scss';

function Pagination({
  page,
  pageCount,
  pageSize,
  pageSizeOptions = [10, 25, 50],
  total,
  onPageChange,
  onPageSizeChange,
}) {
  const selectId = useId();
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className={styles.pagination}>
      <p className={styles.summary} aria-live="polite">
        {total === 0 ? 'No results' : `Showing ${start}–${end} of ${total}`}
      </p>

      <div className={styles.controls}>
        <label htmlFor={selectId} className={styles.pageSize}>
          Rows per page
          <select
            id={selectId}
            className={styles.select}
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>

        <div className={styles.pager}>
          <button
            type="button"
            className={styles.button}
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
          >
            Prev
          </button>
          <span className={styles.pageInfo}>
            Page {page} of {pageCount}
          </span>
          <button
            type="button"
            className={styles.button}
            onClick={() => onPageChange(page + 1)}
            disabled={page >= pageCount}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default Pagination;
