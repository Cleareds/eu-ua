import type { Metadata } from "next";
import Link from "next/link";
import { getFeaturedArtObjects, getArtWaves, getFeaturedArtists, getRecentArtObjects, getArtArtists } from "@/lib/supabase/art-data";
import ArtObjectCard from "@/components/art/ArtObjectCard";
import ArtistCard from "@/components/art/ArtistCard";
import WaveCard from "@/components/art/WaveCard";

// Statically rendered and refreshed hourly; admin writes purge this path
// immediately via lib/revalidate-art.ts.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Ukrainian Art — EU-UA.com",
  description: "A personal selection of Ukrainian paintings and the artists behind them — landscapes, still lifes, portraits and folk art we love.",
  openGraph: {
    title: "Ukrainian Art — EU-UA.com",
    description: "A personal selection of Ukrainian paintings and the artists behind them.",
    type: "website",
  },
};

export default async function UkrainianArtPage() {
  const [featured, waves, featuredArtists, recent, allArtists] = await Promise.all([
    getFeaturedArtObjects(9),
    getArtWaves(),
    getFeaturedArtists(6),
    getRecentArtObjects(6),
    getArtArtists(),
  ]);

  // Show featured if any exist, otherwise the 6 most recently added
  const heroWorks = featured.length > 0 ? featured : recent;
  // Show featured artists if any are flagged, otherwise the first 12 from the collection
  const artistsToShow = featuredArtists.length > 0 ? featuredArtists : allArtists.slice(0, 12);
  const hasContent = heroWorks.length > 0 || waves.length > 0 || artistsToShow.length > 0;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F8F9FA" }}>
      {/* Hero */}
      <section className="py-16 px-4" style={{ backgroundColor: "#003399" }}>
        <div className="max-w-7xl mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest mb-4 px-3 py-1 rounded-full" style={{ backgroundColor: "#FFD700", color: "#003399" }}>
            Ukrainian Art
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight">
            Ukrainian Visual Art
          </h1>
          <p className="text-white/80 text-lg max-w-2xl leading-relaxed">
            A personal selection of Ukrainian artists and works we love — landscapes, still lifes, portraits, folk art and more. Not a textbook, not a survey: just paintings worth looking at, gathered in one place.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <Link href="/ukrainian-art/art" className="text-sm px-5 py-2.5 rounded-lg font-medium transition-opacity hover:opacity-90" style={{ backgroundColor: "#FFD700", color: "#003399" }}>
              All Works
            </Link>
            <Link href="/ukrainian-art/waves" className="text-sm px-5 py-2.5 rounded-lg font-medium text-white bg-white/10 hover:bg-white/20 transition-colors">
              Art Movements
            </Link>
            <Link href="/ukrainian-art/artists" className="text-sm px-5 py-2.5 rounded-lg font-medium text-white bg-white/10 hover:bg-white/20 transition-colors">
              Artists
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {!hasContent && (
          <div className="py-24 text-center">
            <div className="text-5xl mb-4">🖼</div>
            <p className="text-gray-500 text-lg mb-2">The gallery is being curated.</p>
            <p className="text-gray-400 text-sm">Art objects, artists, and movements will appear here once added via the admin panel.</p>
          </div>
        )}

        {/* Featured Artworks */}
        {heroWorks.length > 0 && (
          <section className="py-12">
            <div className="flex items-end justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold" style={{ color: "#1A1A2E" }}>
                  {featured.length > 0 ? "Featured Works" : "Recent Additions"}
                </h2>
              </div>
              <Link href="/ukrainian-art/art" className="text-sm font-medium hover:underline" style={{ color: "#003399" }}>
                All works →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {heroWorks.map(obj => <ArtObjectCard key={obj.id} obj={obj} />)}
            </div>
          </section>
        )}

        {/* Art Movements */}
        {waves.length > 0 && (
          <section className="py-12 border-t border-gray-200">
            <div className="flex items-end justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold" style={{ color: "#1A1A2E" }}>Art Movements</h2>
                <p className="text-gray-500 text-sm mt-1">Periods, styles, and schools that shaped Ukrainian art history</p>
              </div>
              <Link href="/ukrainian-art/waves" className="text-sm font-medium hover:underline" style={{ color: "#003399" }}>
                All movements →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {waves.slice(0, 6).map(wave => <WaveCard key={wave.id} wave={wave} />)}
            </div>
          </section>
        )}

        {/* Artists */}
        {artistsToShow.length > 0 && (
          <section className="py-12 border-t border-gray-200">
            <div className="flex items-end justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold" style={{ color: "#1A1A2E" }}>Artists</h2>
                <p className="text-gray-500 text-sm mt-1">Ukrainian painters, sculptors, and visual artists</p>
              </div>
              <Link href="/ukrainian-art/artists" className="text-sm font-medium hover:underline" style={{ color: "#003399" }}>
                All artists →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {artistsToShow.map(artist => <ArtistCard key={artist.id} artist={artist} />)}
            </div>
          </section>
        )}

        {/* About section */}
        <section className="py-12 border-t border-gray-200">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-bold mb-4" style={{ color: "#1A1A2E" }}>About This Collection</h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              This curated collection documents the richness of Ukrainian visual art — from medieval icon painting through the modernist explosion of the early 20th century, the suppressed avant-garde of the Soviet era, and the vibrant contemporary scene that continues to evolve amid Ukraine's struggle for independence and European integration.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Ukrainian art has long been underrepresented in global art history. This project aims to change that by providing accessible, contextualized information about Ukrainian artists, their works, and the movements that shaped them.
            </p>
          </div>
        </section>

      </div>
    </div>
  );
}
