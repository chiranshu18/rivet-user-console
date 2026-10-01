import { useEffect, useState } from 'react';

function readStored(storageKey, defaultValue, isValid) {
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw === null) return defaultValue;
    const parsed = JSON.parse(raw);
    return isValid(parsed) ? parsed : defaultValue;
  } catch {
    return defaultValue;
  }
}

/**
 * `useState` that is saved to localStorage (as JSON) and restored on the next mount.
 * Stored values failing `isValid` (stale or hand-edited) fall back to `defaultValue`.
 * Without a `storageKey` it behaves like plain `useState`. The key must not change between renders.
 */
export default function usePersistentState(storageKey, defaultValue, isValid = () => true) {
  const [value, setValue] = useState(() =>
    storageKey ? readStored(storageKey, defaultValue, isValid) : defaultValue
  );

  useEffect(() => {
    if (!storageKey) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(value));
    } catch {
      // Storage unavailable (e.g. private mode): the value is kept for this page load only.
    }
  }, [storageKey, value]);

  return [value, setValue];
}
