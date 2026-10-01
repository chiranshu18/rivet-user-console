import Papa from 'papaparse';

const DATASETS = {
  users: {
    file: 'users.csv',
    columns: ['user_id', 'name', 'join_time', 'status', 'last_active_time'],
  },
  profiles: {
    file: 'user_profiles.csv',
    columns: [
      'user_id',
      'app_version',
      'device_info',
      'location',
      'language',
      'profile_thumbnail_url',
      'profile_full_url',
    ],
  },
  sessions: {
    file: 'user_sessions.csv',
    columns: [
      'user_id',
      'session_start',
      'session_duration_minutes',
      'device',
      'entry_screen',
      'exit_screen',
    ],
    numericColumns: ['session_duration_minutes'],
  },
  analytics: {
    file: 'analytics.csv',
    columns: ['date', 'daily_active_users', 'new_users', 'returning_users', 'deleted_users'],
    numericColumns: ['daily_active_users', 'new_users', 'returning_users', 'deleted_users'],
  },
};

const pending = new Map();
const resolved = new Map();

function toNumbers(rows, numericColumns = []) {
  if (numericColumns.length === 0) return rows;
  return rows.map((row) => {
    const next = { ...row };
    numericColumns.forEach((column) => {
      next[column] = Number(next[column]);
    });
    return next;
  });
}

async function fetchDataset(name) {
  const dataset = DATASETS[name];
  if (!dataset) {
    throw new Error(`Unknown dataset "${name}"`);
  }

  const response = await fetch(`${process.env.PUBLIC_URL}/data/${dataset.file}`);
  if (!response.ok) {
    throw new Error(`Failed to load ${dataset.file} (HTTP ${response.status})`);
  }

  const text = await response.text();
  const { data, errors, meta } = Papa.parse(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  });

  // The dev server answers unknown paths with index.html (HTTP 200), so a missing
  // file only shows up as missing columns.
  const missingColumns = dataset.columns.filter((column) => !meta.fields?.includes(column));
  if (missingColumns.length === dataset.columns.length) {
    throw new Error(`Failed to load ${dataset.file} (file missing or not a CSV)`);
  }
  if (missingColumns.length > 0) {
    throw new Error(`Invalid format in ${dataset.file}: missing ${missingColumns.join(', ')}`);
  }
  if (errors.length > 0) {
    throw new Error(`Could not parse ${dataset.file}: ${errors[0].message} (row ${errors[0].row})`);
  }

  return toNumbers(data, dataset.numericColumns);
}

/** Loads a dataset once per app session; failed loads are not cached so they can be retried. */
export function loadCsv(name) {
  if (!pending.has(name)) {
    const request = fetchDataset(name).then(
      (rows) => {
        resolved.set(name, rows);
        return rows;
      },
      (error) => {
        pending.delete(name);
        throw error;
      }
    );
    pending.set(name, request);
  }
  return pending.get(name);
}

/** Returns already-loaded rows synchronously, or undefined if not loaded yet. */
export function getCachedCsv(name) {
  return resolved.get(name);
}
