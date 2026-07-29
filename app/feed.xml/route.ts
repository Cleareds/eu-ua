import { getNews } from "@/lib/data";
import { SITE_URL } from "@/lib/site";

export const revalidate = 3600; // refresh hourly

const SITE = SITE_URL;

function escape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function rfc822(dateStr: string): string {
  // Parse YYYY-MM-DD or ISO; fall back to now
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return new Date().toUTCString();
  return d.toUTCString();
}

export async function GET() {
  const news = await getNews(50);

  const lastBuildDate = news[0]?.date ? rfc822(news[0].date) : new Date().toUTCString();

  const items = news
    .map(item => {
      // Use the article's URL as both link and guid; mark guid isPermaLink="false"
      // so feed readers don't dedupe across feeds that reference the same source.
      return `    <item>
      <title>${escape(item.headline)}</title>
      <link>${escape(item.url)}</link>
      <guid isPermaLink="false">${escape(item.url)}</guid>
      <pubDate>${rfc822(item.date)}</pubDate>
      <source url="${SITE}/news">${escape(item.source)}</source>
      <description>${escape(item.summary)}</description>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>EU-UA.com — Ukraine &amp; Europe News</title>
    <link>${SITE}/news</link>
    <atom:link href="${SITE}/feed.xml" rel="self" type="application/rss+xml" />
    <description>Daily-updated news on Ukraine's EU accession progress, policy developments, and European integration.</description>
    <language>en</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
