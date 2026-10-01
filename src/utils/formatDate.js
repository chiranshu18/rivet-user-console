const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const DATE_TIME_PATTERN = /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?$/;

const pad = (value) => String(value).padStart(2, '0');

/**
 * Parses 'YYYY-MM-DD' or 'YYYY-MM-DD HH:mm[:ss]' as local time.
 * Parsed manually because Safari rejects the space-separated form in `new Date()`.
 */
export function parseDateTime(value) {
  const match = DATE_TIME_PATTERN.exec(String(value ?? '').trim());
  if (!match) return null;
  const [, year, month, day, hours = 0, minutes = 0, seconds = 0] = match.map((part) =>
    part === undefined ? undefined : Number(part)
  );
  return new Date(year, month - 1, day, hours, minutes, seconds);
}

/** '2025-06-16 07:59:34' → '16 Jun 2025, 07:59' */
export function formatDateTime(value) {
  const date = parseDateTime(value);
  if (!date) return '—';
  return `${pad(date.getDate())} ${MONTHS[date.getMonth()]} ${date.getFullYear()}, ${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}

/** '2025-09-07' → '07 Sep' */
export function formatShortDate(value) {
  const date = parseDateTime(value);
  if (!date) return '—';
  return `${pad(date.getDate())} ${MONTHS[date.getMonth()]}`;
}

/** '2025-09-07' → '07 Sep 2025' */
export function formatDate(value) {
  const date = parseDateTime(value);
  if (!date) return '—';
  return `${pad(date.getDate())} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}
