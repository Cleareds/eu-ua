import type { Metadata } from "next";
import Link from "next/link";
import { getArtObjects, getArtArtists } from "@/lib/supabase/art-data";
import ArtObjectCard from "@/components/art/ArtObjectCard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "All Artworks — Ukrainian Art — EU-UA.com",
  description: "Browse the full collection of Ukrainian paintings, icons, and graphic works — and the artists behind them.",
  openGraph: {
    title: "All Artworks — Ukrainian Art — EU-UA.com",
    description: "Browse the full collection of Ukrainian paintings, icons, and graphic works.",
    type: "website",
  },
};

export default async function AllArtPage() {
  const [works, artists] = await Promise.all([
    getArtObjects(),
    getArtArtists(),
  ]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F8F9FA" }}>
      {/* Header */}
      <div className="py-12 px-4" style={{ backgroundColor: "#003399" }}>
        <div className="max-w-7xl mx-auto">
          <nav className="text-xs text-white/50 mb-4 flex gap-2">
            <Link href="/ukrainian-art" className="hover:text-white">Ukrainian Art</Link>
            <span>/</span>
            <span className="text-white/80">All Artworks</span>
          </nav>
          <h1 className="text-4xl font-bold text-white mb-2">All Artworks</h1>
          <p className="text-white/70 max-w-xl">
            The full collection — {works.length} works by {artists.length} Ukrainian artists, from Baroque icons to the modernist avant-garde.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* All artworks */}
        {works.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-4xl mb-3">🖼</div>
            <p>No artworks yet. Check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {works.map(obj => <ArtObjectCard key={obj.id} obj={obj} />)}
          </div>
        )}
      </div>
    </div>
  );
}
