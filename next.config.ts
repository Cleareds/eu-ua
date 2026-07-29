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
  },
};

export default nextConfig;
