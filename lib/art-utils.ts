const UA_TO_LATIN: Record<string, string> = {
  'а': 'a', 'б': 'b', 'в': 'v', 'г': 'h', 'ґ': 'g', 'д': 'd', 'е': 'e',
  'є': 'ye', 'ж': 'zh', 'з': 'z', 'и': 'y', 'і': 'i', 'ї': 'yi', 'й': 'y',
  'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r',
  'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch',
  'ш': 'sh', 'щ': 'shch', 'ь': '', 'ю': 'yu', 'я': 'ya',
  'А': 'a', 'Б': 'b', 'В': 'v', 'Г': 'h', 'Ґ': 'g', 'Д': 'd', 'Е': 'e',
  'Є': 'ye', 'Ж': 'zh', 'З': 'z', 'И': 'y', 'І': 'i', 'Ї': 'yi', 'Й': 'y',
  'К': 'k', 'Л': 'l', 'М': 'm', 'Н': 'n', 'О': 'o', 'П': 'p', 'Р': 'r',
  'С': 's', 'Т': 't', 'У': 'u', 'Ф': 'f', 'Х': 'kh', 'Ц': 'ts', 'Ч': 'ch',
  'Ш': 'sh', 'Щ': 'shch', 'Ь': '', 'Ю': 'yu', 'Я': 'ya',
};

export function generateSlug(text: string): string {
  return text
    .split('')
    .map(char => UA_TO_LATIN[char] ?? char)
    .join('')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function parseTags(raw: string): string[] {
  return raw
    .split(',')
    .map(t => t.trim().toLowerCase())
    .filter(Boolean);
}

export function formatTags(tags: string[]): string {
  return tags.join(', ');
}

export function artistLifespan(born?: number | null, died?: number | null): string {
  if (!born) return '';
  return died ? `${born}–${died}` : `b. ${born}`;
}

/**
 * Returns the original storage URL unchanged.
 * next/image handles optimization (resize, format, quality) via its own pipeline.
 * The `width` and `quality` params are accepted but unused — kept for call-site
 * compatibility so callers don't need to change.
 */
export function getArtImageUrl(
  url: string | null | undefined,
  _opts: { width?: number; quality?: number } = {}
): string | null {
  return url ?? null;
}
