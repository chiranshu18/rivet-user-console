import Papa from 'papaparse';

/** Rows → CSV text with `fields` as the header row and column order (quoting handled by PapaParse). */
export function toCsv(rows, fields) {
  return Papa.unparse({
    fields,
    data: rows.map((row) => fields.map((field) => row[field] ?? '')),
  });
}

/** Triggers a browser download of `csv` as `filename`. */
export function downloadCsv(filename, csv) {
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/** Today's local date as 'YYYY-MM-DD', for file names. */
export function todayStamp() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}
