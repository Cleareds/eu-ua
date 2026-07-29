import type { Metadata } from "next";
import { getArtArtists } from "@/lib/supabase/art-data";
import ArtistCard from "@/components/art/ArtistCard";
import Link from "next/link";

// Statically rendered and refreshed hourly; admin writes purge this path
// immediately via lib/revalidate-art.ts.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Ukrainian Artists — EU-UA.com",
  description: "Discover Ukrainian visual artists from the Baroque era to contemporary times. Painters, sculptors, graphic artists, and more.",
};

export default async function ArtistsPage() {
  const artists = await getArtArtists();

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F8F9FA" }}>
      {/* Header */}
      <div className="py-12 px-4" style={{ backgroundColor: "#003399" }}>
        <div className="max-w-7xl mx-auto">
          <nav className="text-xs text-white/50 mb-4 flex gap-2">
            <Link href="/ukrainian-art" className="hover:text-white">Ukrainian Art</Link>
            <span>/</span>
            <span className="text-white/80">Artists</span>
          </nav>
          <h1 className="text-4xl font-bold text-white mb-2">Ukrainian Artists</h1>
          <p className="text-white/70 max-w-xl">
            Painters, sculptors, and visual artists who shaped Ukrainian art across centuries.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {artists.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-4xl mb-3">👤</div>
            <p>No artists yet. Check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {artists.map(artist => <ArtistCard key={artist.id} artist={artist} />)}
          </div>
        )}
      </div>
    </div>
  );
}
