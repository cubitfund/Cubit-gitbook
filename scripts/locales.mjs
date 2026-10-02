export const locales = [
  { id: 'en', tag: 'en', name: 'English', flag: 'us' },
  { id: 'fr', tag: 'fr', name: 'Français', flag: 'fr' },
  { id: 'pt-br', tag: 'pt-BR', name: 'Português (Brasil)', flag: 'br' },
  { id: 'es', tag: 'es', name: 'Español', flag: 'es' },
  { id: 'de', tag: 'de', name: 'Deutsch', flag: 'de' },
  { id: 'it', tag: 'it', name: 'Italiano', flag: 'it' },
  { id: 'zh', tag: 'zh-Hans', name: '中文', flag: 'cn' },
  { id: 'ko', tag: 'ko', name: '한국어', flag: 'kr' },
  { id: 'ja', tag: 'ja', name: '日本語', flag: 'jp' },
  { id: 'vi', tag: 'vi', name: 'Tiếng Việt', flag: 'vn' },
];

export function matchLocale(value, available = locales) {
  if (typeof value !== 'string') return undefined;
  const normalized = value.toLowerCase().replaceAll('_', '-');
  const exact = available.find(locale => locale.id === normalized || locale.tag.toLowerCase() === normalized);
  return exact?.id || available.find(locale => locale.id.split('-')[0] === normalized.split('-')[0])?.id;
}

export function preferredLocale(saved, preferences, available = locales) {
  const explicit = available.find(locale => locale.id === saved);
  if (explicit) return explicit.id;
  for (const preference of preferences || []) {
    const match = matchLocale(preference, available);
    if (match) return match;
  }
  return available.find(locale => locale.id === 'en')?.id || available[0].id;
}
