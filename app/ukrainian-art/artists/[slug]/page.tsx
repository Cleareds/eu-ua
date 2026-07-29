import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getArtArtistBySlug, getArtObjectsByArtist, getAllArtistSlugs } from "@/lib/supabase/art-data";
import { artistLifespan, getArtImageUrl } from "@/lib/art-utils";
import MarkdownContent from "@/components/art/MarkdownContent";
import ArtObjectCard from "@/components/art/ArtObjectCard";
import JsonLd from "@/components/seo/JsonLd";
import { SITE_URL } from "@/lib/site";

// Prerendered at build time from generateStaticParams below, refreshed hourly,
// and purged on admin writes via lib/revalidate-art.ts. Slugs created after the
// build (e.g. by the add-art skill) render on first request, then cache.
export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = await getAllArtistSlugs();
  return slugs.map(slug => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const artist = await getArtArtistBySlug(slug);
  if (!artist) return { title: "Artist Not Found — EU-UA.com" };
  return {
    title: `${artist.name} — Ukrainian Artist — EU-UA.com`,
    description: artist.short_bio,
    alternates: { canonical: `/ukrainian-art/artists/${artist.slug}` },
    openGraph: {
      title: artist.name,
      description: artist.short_bio,
      images: artist.profile_image_url ? [{ url: artist.profile_image_url }] : [],
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title: artist.name,
      description: artist.short_bio,
      images: artist.profile_image_url ? [artist.profile_image_url] : [],
    },
  };
}

export default async function ArtistPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const artist = await getArtArtistBySlug(slug);
  if (!artist) notFound();

  const artworks = await getArtObjectsByArtist(artist.id);

  const personLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: artist.name,
    alternateName: artist.name_uk ?? undefined,
    description: artist.short_bio,
    url: `${SITE_URL}/ukrainian-art/artists/${artist.slug}`,
    image: artist.profile_image_url ?? undefined,
    birthDate: artist.born ? String(artist.born) : undefined,
    deathDate: artist.died ? String(artist.died) : undefined,
    birthPlace: artist.birth_place ?? undefined,
    nationality: "Ukrainian",
    sameAs: artist.website_url ? [artist.website_url] : undefined,
    jobTitle: "Visual Artist",
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F8F9FA" }}>
      <JsonLd data={personLd} />
      {/* Hero */}
      <div className="py-12 px-4" style={{ backgroundColor: "#1A1A2E" }}>
        <div className="max-w-7xl mx-auto">
          <nav className="text-xs text-white/40 mb-6 flex gap-2">
            <Link href="/ukrainian-art" className="hover:text-white">Ukrainian Art</Link>
            <span>/</span>
            <Link href="/ukrainian-art/artists" className="hover:text-white">Artists</Link>
            <span>/</span>
            <span className="text-white/60">{artist.name}</span>
          </nav>
          <div className="flex items-start gap-8">
            {artist.profile_image_url && (
              <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden shrink-0 border-4 border-white/10">
                <Image
                  src={getArtImageUrl(artist.profile_image_url, { width: 320, quality: 85 }) ?? artist.profile_image_url}
                  alt={artist.name}
                  fill
                  // Without this, `fill` defaults to sizes="100vw" and the browser
                  // picks a 1920w–3840w candidate for a 160px circle.
                  sizes="160px"
                  className="object-cover object-top"
                  priority
                />
              </div>
            )}
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-1">{artist.name}</h1>
              {artist.name_uk && <p className="text-white/50 text-xl mb-3 font-light">{artist.name_uk}</p>}
              {(artist.born || artist.birth_place) && (
                <p className="text-white/60 text-sm mb-3">
                  {artistLifespan(artist.born, artist.died)}
                  {artist.birth_place && ` · ${artist.birth_place}`}
                </p>
              )}
              {artist.waves && artist.waves.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {artist.waves.map(wave => (
                    <Link
                      key={wave.id}
                      href={`/ukrainian-art/waves/${wave.slug}`}
                      className="text-xs px-3 py-1 rounded-full font-medium hover:opacity-80 transition-opacity"
                      style={{ backgroundColor: "#FFD700", color: "#003399" }}
                    >
                      {wave.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-12">

          {/* Biography */}
          <div>
            <p className="text-gray-600 text-base leading-relaxed border-l-4 pl-4 mb-8" style={{ borderColor: "#FFD700" }}>
              {artist.short_bio}
            </p>
            {artist.full_bio && <MarkdownContent content={artist.full_bio} />}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Quick facts */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Quick facts</h3>
              <dl className="space-y-3 text-sm">
                {artist.born && (
                  <div>
                    <dt className="text-xs text-gray-400">Born</dt>
                    <dd className="font-medium text-gray-800">{artist.born}{artist.birth_place ? `, ${artist.birth_place}` : ""}</dd>
                  </div>
                )}
                {artist.died && (
                  <div>
                    <dt className="text-xs text-gray-400">Died</dt>
                    <dd className="font-medium text-gray-800">{artist.died}</dd>
                  </div>
                )}
                {artist.website_url && (
                  <div>
                    <dt className="text-xs text-gray-400">Website</dt>
                    <dd>
                      <a
                        href={artist.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium hover:underline break-all"
                        style={{ color: "#003399" }}
                      >
                        All works →
                      </a>
                    </dd>
                  </div>
                )}
                {artist.waves && artist.waves.length > 0 && (
                  <div>
                    <dt className="text-xs text-gray-400">Movements</dt>
                    <dd className="space-y-1">
                      {artist.waves.map(wave => (
                        <Link key={wave.id} href={`/ukrainian-art/waves/${wave.slug}`} className="block font-medium hover:underline" style={{ color: "#003399" }}>
                          {wave.name}
                        </Link>
                      ))}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Tags */}
            {artist.tags?.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Tags</h3>
                <div className="flex flex-wrap gap-1.5">
                  {artist.tags.map(tag => (
                    <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">{tag}</span>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>

        {/* Movements */}
        {artist.waves && artist.waves.length > 0 && (
          <section className="mt-12 pt-8 border-t border-gray-200">
            <h2 className="text-2xl font-bold mb-6" style={{ color: "#1A1A2E" }}>Art Movements</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {artist.waves.map(wave => (
                <Link
                  key={wave.id}
                  href={`/ukrainian-art/waves/${wave.slug}`}
                  className="group block bg-white rounded-xl border border-gray-100 p-5 hover:border-blue-200 hover:shadow-sm transition-all"
                >
                  {wave.period && (
                    <span className="text-xs font-mono font-medium mb-2 block" style={{ color: "#003399" }}>
                      {wave.period}
                    </span>
                  )}
                  <h3 className="font-bold text-base mb-2 group-hover:underline" style={{ color: "#1A1A2E" }}>
                    {wave.name}
                  </h3>
                  {wave.description && (
                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{wave.description}</p>
                  )}
                  <span className="text-xs font-medium mt-3 block" style={{ color: "#003399" }}>
                    Explore movement →
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Artworks */}
        {artworks.length > 0 && (
          <section className="mt-12 pt-8 border-t border-gray-200">
            <h2 className="text-2xl font-bold mb-6" style={{ color: "#1A1A2E" }}>
              Works by {artist.name}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {artworks.map(obj => <ArtObjectCard key={obj.id} obj={obj} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
