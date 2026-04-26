"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ROUTE_LABELS: Record<string, string> = {
  "eu-accession": "EU Accession",
  "cultural-map": "Cultural Map",
  "data-dashboard": "Data Dashboard",
  "ukrainian-art": "Ukrainian Art",
  artists: "Artists",
  waves: "Movements",
  art: "Artwork",
  admin: "Admin",
  timeline: "Timeline",
  people: "People",
  heritage: "Heritage",
  news: "News",
  myths: "Myths",
  quiz: "Quiz",
  contact: "Contact",
};

export default function Breadcrumbs() {
  const pathname = usePathname();
  if (pathname === "/" || pathname.startsWith("/admin")) return null;

  const segments = pathname.split("/").filter(Boolean);
  const items = segments.map((seg, i) => ({
    label: ROUTE_LABELS[seg] || seg.charAt(0).toUpperCase() + seg.slice(1),
    href: "/" + segments.slice(0, i + 1).join("/"),
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://eu-ua.com" },
      ...items.map((item, i) => ({
        "@type": "ListItem",
        position: i + 2,
        name: item.label,
        item: `https://eu-ua.com${item.href}`,
      })),
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav
        aria-label="Breadcrumb"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2"
      >
        <ol className="flex items-center gap-1.5 text-xs text-gray-500">
          <li>
            <Link href="/" className="hover:text-gray-700 transition-colors">
              Home
            </Link>
          </li>
          {items.map((item, i) => (
            <li key={item.href} className="flex items-center gap-1.5">
              <span className="text-gray-300">/</span>
              {i === items.length - 1 ? (
                <span className="font-medium text-gray-700">{item.label}</span>
              ) : (
                <Link href={item.href} className="hover:text-gray-700 transition-colors">
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
