/**
 * Legacy → current slug map for Ukrainian Art content.
 *
 * When a record's slug is edited in the admin (e.g. re-transliterating a name
 * from Russian to Ukrainian), the old URL stays alive in Google's index, in the
 * sitemap cache and in anyone's bookmarks. Add the old slug here so the old URL
 * 301s to the new one instead of rendering an empty page.
 *
 * Keys must be slugs that no longer exist in the database; values must exist.
 */

export const ARTIST_SLUG_REDIRECTS: Record<string, string> = {
  // Ukrainian transliteration pass, 29 Jul 2026
  "kazimir-malevich": "kazymyr-malevych",
  "hryhorii-svitlytsky": "hryhorii-svitlytskyi",
  "antin-losenko": "anton-losenko",
};

export const ART_OBJECT_SLUG_REDIRECTS: Record<string, string> = {
  // Ukrainian transliteration pass, 29 Jul 2026
  "black-square-malevich": "black-square-malevych",
  "white-on-white-malevich": "white-on-white-malevych",
};

export const ART_WAVE_SLUG_REDIRECTS: Record<string, string> = {};

/** All maps keyed by their URL segment under /ukrainian-art/. */
export const ART_SLUG_REDIRECTS = {
  artists: ARTIST_SLUG_REDIRECTS,
  art: ART_OBJECT_SLUG_REDIRECTS,
  waves: ART_WAVE_SLUG_REDIRECTS,
} as const;
