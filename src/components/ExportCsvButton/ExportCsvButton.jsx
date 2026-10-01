import { downloadCsv, toCsv } from '../../utils/csvExport';
import styles from './ExportCsvButton.module.scss';

/**
 * Downloads `rows` as a CSV file with `fields` as columns. Disabled when there is nothing to export.
 * @param {{ rows: Object[], fields: string[], filename: string }} props
 */
function ExportCsvButton({ rows, fields, filename }) {
  const count = rows.length;
  const description =
    count === 0 ? 'No rows to export' : `Download ${count} ${count === 1 ? 'row' : 'rows'} as CSV`;

  return (
    <button
      type="button"
      className={styles.button}
      onClick={() => downloadCsv(filename, toCsv(rows, fields))}
      disabled={count === 0}
      title={description}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
      </svg>
      {`Export CSV (${count})`}
    </button>
  );
}

export default ExportCsvButton;
