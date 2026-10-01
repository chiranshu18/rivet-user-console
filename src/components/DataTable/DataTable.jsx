import styles from './DataTable.module.scss';

const ARIA_SORT = { asc: 'ascending', desc: 'descending' };
const SORT_ICON = { asc: '▲', desc: '▼' };

/**
 * @param {{ key: string, header: string, render?: (row) => any, sortable?: boolean }[]} columns
 * @param {Object[]} rows
 * @param {(row) => string} getRowKey
 * @param {{ key: string | null, direction: 'asc' | 'desc' | null }} [sort]
 * @param {(key: string) => void} [onSort]
 * @param {string} [emptyMessage]
 */
function DataTable({ columns, rows, getRowKey, sort, onSort, emptyMessage = 'No results found.' }) {
  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((column) => {
              const direction = sort?.key === column.key ? sort.direction : null;
              return (
                <th
                  key={column.key}
                  scope="col"
                  aria-sort={column.sortable ? ARIA_SORT[direction] ?? 'none' : undefined}
                >
                  {column.sortable ? (
                    <button
                      type="button"
                      className={styles.sortButton}
                      onClick={() => onSort(column.key)}
                    >
                      {column.header}
                      <span
                        className={direction ? styles.sortIconActive : styles.sortIcon}
                        aria-hidden="true"
                      >
                        {SORT_ICON[direction] ?? '↕'}
                      </span>
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className={styles.empty}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={getRowKey(row)}>
                {columns.map((column) => (
                  <td key={column.key}>{column.render ? column.render(row) : row[column.key]}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
