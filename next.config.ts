import type { NextConfig } from "next";
import { ART_SLUG_REDIRECTS } from "./lib/slug-redirects";

const nextConfig: NextConfig = {
  turbopack: {},
  async redirects() {
    return Object.entries(ART_SLUG_REDIRECTS).flatMap(([segment, map]) =>
      Object.entries(map).map(([from, to]) => ({
        source: `/ukrainian-art/${segment}/${from}`,
        destination: `/ukrainian-art/${segment}/${to}`,
        permanent: true,
      })),
    );
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/**",
      },
    ],
    // AVIF first — paintings are large, detailed images and it beats WebP by
    // roughly 20-30% on them. Next falls back to WebP for browsers without it.
    formats: ["image/avif", "image/webp"],
    // Trimmed from the default [640, 750, 828, 1080, 1200, 1920, 2048, 3840].
    // Every candidate width becomes another ~1.7 KB entry in every srcset: on
    // /ukrainian-art/art, 174 card images spent 302 KB of the 776 KB response on
    // srcset alone. Nothing on the site is displayed above ~2560px, and fewer
    // variants also means a higher image-cache hit rate.
    deviceSizes: [640, 828, 1080, 1920, 2560],
    // Optimized images are immutable (the storage URL changes when a file is
    // replaced), so let the CDN keep them for a month instead of 4 hours.
    minimumCacheTTL: 2678400,
  },
};

export default nextConfig;
