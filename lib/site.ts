/**
 * The one canonical origin for the site.
 *
 * Must match the domain that actually serves content: the apex (eu-ua.com)
 * redirects to www, so every canonical tag, sitemap entry, feed link and
 * JSON-LD `url` has to say www — otherwise they all point at a URL that
 * redirects, and Google is left to guess which one to index.
 */
export const SITE_URL = "https://www.eu-ua.com";

/**
 * Master switch for newsletter signup. Off until the pieces behind it are in
 * place: the newsletter_subscribers table applied, an email provider wired up for
 * double opt-in, and cookie consent gating analytics. See NEWSLETTER-SETUP.md.
 *
 * Flipping this to true hides/shows the forms AND enables the subscribe endpoint,
 * so there is no window where a hidden form can still be POSTed to. Unsubscribe is
 * deliberately never gated — someone must always be able to get off the list.
 */
export const NEWSLETTER_ENABLED = false;
