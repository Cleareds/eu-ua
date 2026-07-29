/**
 * The one canonical origin for the site.
 *
 * Must match the domain that actually serves content: the apex (eu-ua.com)
 * redirects to www, so every canonical tag, sitemap entry, feed link and
 * JSON-LD `url` has to say www — otherwise they all point at a URL that
 * redirects, and Google is left to guess which one to index.
 */
export const SITE_URL = "https://www.eu-ua.com";
