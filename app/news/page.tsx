import { getNews } from "@/lib/data";
import type { Metadata } from "next";
import JsonLd from "@/components/seo/JsonLd";
import { SITE_URL } from "@/lib/site";

// News is refreshed by the daily fetch-news commit; a 30 min window keeps
// the page CDN-cached without going noticeably stale.
export const revalidate = 1800;

export const metadata: Metadata = {
  title: "EU-Ukraine News — EU-UA.com",
  description: "Latest news on Ukraine's EU integration, accession negotiations, and European connections. Updated daily.",
  alternates: {
    canonical: "/news",
    types: { "application/rss+xml": `${SITE_URL}/feed.xml` },
  },
  openGraph: {
    title: "EU-Ukraine Integration News — EU-UA.com",
    description: "Daily-updated news on Ukraine's EU accession progress, policy developments, and European integration.",
    type: "website",
  },
};

export default async function NewsPage() {
  const news = await getNews(50);

  const newsLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "EU-Ukraine News",
    url: `${SITE_URL}/news`,
    itemListElement: news.slice(0, 20).map((n, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "NewsArticle",
        headline: n.headline,
        description: n.summary,
        url: n.url,
        datePublished: n.date,
        publisher: { "@type": "Organization", name: n.source },
      },
    })),
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <JsonLd data={newsLd} />
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#003399" }}>
          📰 Daily Updates
        </div>
        <h1 className="text-4xl font-bold mb-4" style={{ color: "#1A1A2E" }}>EU-Ukraine News</h1>
        <p className="text-gray-600">
          Latest developments in Ukraine's EU integration journey. Summaries generated daily from international news sources.
        </p>
        <p className="text-xs text-gray-400 mt-2">
          Independent initiative. Summaries are AI-assisted. Always verify with original source.
        </p>
      </div>

      <div className="space-y-4">
        {news.map((item, i) => (
          <article key={item.url} className="bg-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all overflow-hidden">
            <a href={item.url} target="_blank" rel="noopener noreferrer" className="block p-5 group">
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <time className="text-xs text-gray-400 font-mono">{item.date}</time>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: "#F0F4FF", color: "#003399" }}>
                  {item.source}
                </span>
                {i === 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: "#FFD700", color: "#003399" }}>
                    Latest
                  </span>
                )}
              </div>
              <h2 className="font-semibold text-base mb-2 group-hover:underline leading-snug" style={{ color: "#1A1A2E" }}>
                {item.headline}
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">{item.summary}</p>
              <div className="mt-3 text-xs font-medium" style={{ color: "#003399" }}>Read original article →</div>
            </a>
          </article>
        ))}
      </div>

      {news.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">📭</div>
          <p>No news items yet. Run the daily script to populate.</p>
        </div>
      )}
    </div>
  );
}
