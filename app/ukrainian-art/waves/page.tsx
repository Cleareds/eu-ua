import type { Metadata } from "next";
import { getArtWaves } from "@/lib/supabase/art-data";
import WaveCard from "@/components/art/WaveCard";
import Link from "next/link";

// Statically rendered and refreshed hourly; admin writes purge this path
// immediately via lib/revalidate-art.ts.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Ukrainian Art Movements — EU-UA.com",
  description: "Explore the major movements and periods in Ukrainian art history — from Baroque icon painting and the avant-garde to contemporary Ukrainian art.",
};

export default async function WavesPage() {
  const waves = await getArtWaves();

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F8F9FA" }}>
      <div className="py-12 px-4" style={{ backgroundColor: "#003399" }}>
        <div className="max-w-7xl mx-auto">
          <nav className="text-xs text-white/50 mb-4 flex gap-2">
            <Link href="/ukrainian-art" className="hover:text-white">Ukrainian Art</Link>
            <span>/</span>
            <span className="text-white/80">Movements</span>
          </nav>
          <h1 className="text-4xl font-bold text-white mb-2">Art Movements</h1>
          <p className="text-white/70 max-w-xl">
            Periods, schools, and movements that defined Ukrainian art across the centuries.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {waves.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-4xl mb-3">🌊</div>
            <p>No art movements yet. Check back soon.</p>
          </div>
        ) : (
          <>
            {/* Timeline hint */}
            <p className="text-sm text-gray-500 mb-6">
              {waves.length} movement{waves.length !== 1 ? "s" : ""} · ordered chronologically
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {waves.map(wave => <WaveCard key={wave.id} wave={wave} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
