const LANGUAGE_NAMES = {
  en: 'English',
  hi: 'Hindi',
  bn: 'Bengali',
  te: 'Telugu',
  ta: 'Tamil',
};

/** 'bn' → 'Bengali'. Unknown codes are returned unchanged. */
export function getLanguageName(code) {
  if (!code) return '—';
  return LANGUAGE_NAMES[code.trim().toLowerCase()] ?? code;
}
