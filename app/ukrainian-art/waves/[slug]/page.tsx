import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getArtWaveBySlug, getArtistsByWave, getArtObjectsByWave, getAllArtWaveSlugs } from "@/lib/supabase/art-data";
import { getArtImageUrl } from "@/lib/art-utils";
import MarkdownContent from "@/components/art/MarkdownContent";
import ArtObjectCard from "@/components/art/ArtObjectCard";
import ArtistCard from "@/components/art/ArtistCard";
import JsonLd from "@/components/seo/JsonLd";
import { SITE_URL } from "@/lib/site";

// Prerendered at build time from generateStaticParams below, refreshed hourly,
// and purged on admin writes via lib/revalidate-art.ts. Slugs created after the
// build (e.g. by the add-art skill) render on first request, then cache.
export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = await getAllArtWaveSlugs();
  return slugs.map(slug => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const wave = await getArtWaveBySlug(slug);
  if (!wave) return { title: "Movement Not Found — EU-UA.com" };
  return {
    title: `${wave.name} — Ukrainian Art Movement — EU-UA.com`,
    description: wave.description,
    alternates: { canonical: `/ukrainian-art/waves/${wave.slug}` },
    openGraph: {
      title: wave.name,
      description: wave.description,
      images: wave.cover_image_url ? [{ url: wave.cover_image_url }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: wave.name,
      description: wave.description,
      images: wave.cover_image_url ? [wave.cover_image_url] : [],
    },
  };
}

export default async function WavePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const wave = await getArtWaveBySlug(slug);
  if (!wave) notFound();

  const [artists, artworks] = await Promise.all([
    getArtistsByWave(wave.id),
    getArtObjectsByWave(wave.id),
  ]);

  const period = wave.period ?? (wave.start_year
    ? `${wave.start_year}${wave.end_year ? `–${wave.end_year}` : "–present"}`
    : null);

  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: wave.name,
    alternateName: wave.name_uk ?? undefined,
    description: wave.description,
    url: `${SITE_URL}/ukrainian-art/waves/${wave.slug}`,
    image: wave.cover_image_url ?? undefined,
    temporalCoverage: period ?? undefined,
    keywords: wave.tags?.length ? wave.tags.join(", ") : undefined,
    hasPart: artworks.slice(0, 20).map(a => ({
      "@type": "VisualArtwork",
      name: a.title,
      url: `${SITE_URL}/ukrainian-art/art/${a.slug}`,
      image: a.image_url ?? undefined,
      creator: a.artist
        ? { "@type": "Person", name: a.artist.name, url: `${SITE_URL}/ukrainian-art/artists/${a.artist.slug}` }
        : undefined,
    })),
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F8F9FA" }}>
      <JsonLd data={collectionLd} />
      {/* Hero */}
      <div className="relative py-16 px-4 overflow-hidden" style={{ backgroundColor: "#1A1A2E" }}>
        {wave.cover_image_url && (
          <div className="absolute inset-0">
            <Image
              src={getArtImageUrl(wave.cover_image_url, { width: 1600, quality: 70 }) ?? wave.cover_image_url}
              alt=""
              aria-hidden
              fill
              sizes="100vw"
              className="object-cover opacity-20"
            />
          </div>
        )}
        <div className="relative max-w-7xl mx-auto">
          <nav className="text-xs text-white/40 mb-6 flex gap-2">
            <Link href="/ukrainian-art" className="hover:text-white">Ukrainian Art</Link>
            <span>/</span>
            <Link href="/ukrainian-art/waves" className="hover:text-white">Movements</Link>
            <span>/</span>
            <span className="text-white/60">{wave.name}</span>
          </nav>
          {period && (
            <span className="text-sm font-mono font-medium mb-3 block" style={{ color: "#FFD700" }}>{period}</span>
          )}
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">{wave.name}</h1>
          {wave.name_uk && <p className="text-white/50 text-xl mb-4 font-light">{wave.name_uk}</p>}
          <p className="text-white/70 text-lg max-w-2xl leading-relaxed">{wave.description}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Full description */}
        {wave.full_description && (
          <div className="max-w-3xl mb-12">
            <MarkdownContent content={wave.full_description} />
          </div>
        )}

        {/* Artists in this movement */}
        {artists.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6" style={{ color: "#1A1A2E" }}>
              Artists of the Movement
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {artists.map(artist => <ArtistCard key={artist.id} artist={artist} />)}
            </div>
          </section>
        )}

        {/* Artworks from this movement */}
        {artworks.length > 0 && (
          <section className="pt-8 border-t border-gray-200">
            <h2 className="text-2xl font-bold mb-6" style={{ color: "#1A1A2E" }}>
              Works from this Movement
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {artworks.map(obj => <ArtObjectCard key={obj.id} obj={obj} />)}
            </div>
          </section>
        )}

        {artists.length === 0 && artworks.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p>No artists or artworks have been added to this movement yet.</p>
          </div>
        )}

        {/* Tags */}
        {wave.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-gray-200">
            {wave.tags.map(tag => (
              <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">{tag}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
