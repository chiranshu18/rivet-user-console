import { useEffect, useState } from 'react';
import { getCachedCsv, loadCsv } from './csvClient';

function readFromCache(names) {
  const data = {};
  for (const name of names) {
    const rows = getCachedCsv(name);
    if (!rows) return null;
    data[name] = rows;
  }
  return data;
}

function initialState(key) {
  const data = readFromCache(key.split(','));
  return { key, data, loading: !data, error: null };
}

/**
 * Loads several datasets at once.
 * @param {string[]} names e.g. ['users', 'profiles']
 * @returns {{ data: Object<string, Object[]> | null, loading: boolean, error: Error | null }}
 */
export function useCsvs(names) {
  const key = names.join(',');
  const [state, setState] = useState(() => initialState(key));

  useEffect(() => {
    const cached = readFromCache(key.split(','));
    if (cached) {
      setState((prev) => (prev.key === key && prev.data ? prev : { key, data: cached, loading: false, error: null }));
      return undefined;
    }

    let active = true;
    setState({ key, data: null, loading: true, error: null });

    Promise.all(key.split(',').map(loadCsv))
      .then((results) => {
        if (!active) return;
        const data = Object.fromEntries(key.split(',').map((name, index) => [name, results[index]]));
        setState({ key, data, loading: false, error: null });
      })
      .catch((error) => {
        if (active) setState({ key, data: null, loading: false, error });
      });

    return () => {
      active = false;
    };
  }, [key]);

  return { data: state.data, loading: state.loading, error: state.error };
}

/**
 * Loads a single dataset.
 * @param {'users' | 'profiles' | 'sessions' | 'analytics'} name
 * @returns {{ data: Object[] | null, loading: boolean, error: Error | null }}
 */
export default function useCsv(name) {
  const { data, loading, error } = useCsvs([name]);
  return { data: data ? data[name] : null, loading, error };
}
