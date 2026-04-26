import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://eu-ua.com";

  const routes = [
    "",
    "/eu-accession",
    "/cultural-map",
    "/timeline",
    "/people",
    "/heritage",
    "/ukrainian-art",
    "/ukrainian-art/artists",
    "/ukrainian-art/waves",
    "/data-dashboard",
    "/news",
    "/myths",
    "/quiz",
    "/contact",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "/news" ? "daily" : "weekly",
    priority: route === "" ? 1 : route === "/eu-accession" ? 0.9 : 0.7,
  }));
}
