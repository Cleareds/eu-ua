import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getArtObjectBySlug, getArtObjectsByArtist, getArtObjectsByWave, getAllArtObjectSlugs } from "@/lib/supabase/art-data";
import MarkdownContent from "@/components/art/MarkdownContent";
import ArtObjectCard from "@/components/art/ArtObjectCard";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  const slugs = await getAllArtObjectSlugs();
  return slugs.map(slug => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const obj = await getArtObjectBySlug(slug);
  if (!obj) return { title: "Artwork Not Found — EU-UA.com" };
  const artistName = obj.artist?.name;
  return {
    title: `${obj.title}${artistName ? ` — ${artistName}` : ""} — EU-UA.com`,
    description: obj.short_description,
    openGraph: {
      title: obj.title,
      description: obj.short_description,
      images: obj.image_url ? [{ url: obj.image_url }] : [],
      type: "article",
    },
  };
}

export default async function ArtObjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const obj = await getArtObjectBySlug(slug);
  if (!obj) notFound();

  const [byArtist, byWave] = await Promise.all([
    obj.artist_id ? getArtObjectsByArtist(obj.artist_id, slug) : Promise.resolve([]),
    obj.wave_id ? getArtObjectsByWave(obj.wave_id, slug) : Promise.resolve([]),
  ]);

  // Deduplicate related works, prefer byArtist
  const relatedIds = new Set(byArtist.map(r => r.id));
  const related = [
    ...byArtist.slice(0, 4),
    ...byWave.filter(r => !relatedIds.has(r.id)).slice(0, 4 - byArtist.slice(0, 4).length),
  ].slice(0, 4);

  const artistSlug = obj.artist?.slug;
  const artistName = obj.artist?.name;
  const waveSlug = obj.wave?.slug;
  const waveName = obj.wave?.name;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F8F9FA" }}>
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <nav className="flex items-center gap-2 text-xs text-gray-400 mb-6">
          <Link href="/ukrainian-art" className="hover:underline" style={{ color: "#003399" }}>Ukrainian Art</Link>
          <span>/</span>
          <span className="text-gray-600 truncate">{obj.title}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,360px] gap-10">

          {/* Main content */}
          <div>
            {/* Image */}
            {obj.image_url && (
              <div className="relative w-full rounded-xl overflow-hidden bg-gray-100 mb-8" style={{ maxHeight: "600px" }}>
                <Image
                  src={obj.image_url}
                  alt={obj.title}
                  width={900}
                  height={600}
                  className="w-full h-auto object-contain"
                  priority
                />
              </div>
            )}

            {/* Title */}
            <h1 className="text-3xl font-bold mb-2" style={{ color: "#1A1A2E" }}>{obj.title}</h1>
            {obj.title_uk && (
              <p className="text-gray-400 text-lg mb-4 font-light">{obj.title_uk}</p>
            )}

            {/* Metadata row */}
            <div className="flex flex-wrap gap-4 mb-6 text-sm text-gray-600">
              {artistName && artistSlug && (
                <div>
                  <span className="text-xs text-gray-400 block mb-0.5">Artist</span>
                  <Link href={`/ukrainian-art/artists/${artistSlug}`} className="font-medium hover:underline" style={{ color: "#003399" }}>
                    {artistName}
                  </Link>
                </div>
              )}
              {waveName && waveSlug && (
                <div>
                  <span className="text-xs text-gray-400 block mb-0.5">Movement</span>
                  <Link href={`/ukrainian-art/waves/${waveSlug}`} className="font-medium hover:underline" style={{ color: "#003399" }}>
                    {waveName}
                  </Link>
                </div>
              )}
              {obj.year && (
                <div>
                  <span className="text-xs text-gray-400 block mb-0.5">Year</span>
                  <span className="font-medium">{obj.year}</span>
                </div>
              )}
              {obj.medium && (
                <div>
                  <span className="text-xs text-gray-400 block mb-0.5">Medium</span>
                  <span className="font-medium">{obj.medium}</span>
                </div>
              )}
              {obj.dimensions && (
                <div>
                  <span className="text-xs text-gray-400 block mb-0.5">Dimensions</span>
                  <span className="font-medium">{obj.dimensions}</span>
                </div>
              )}
              {obj.location && (
                <div>
                  <span className="text-xs text-gray-400 block mb-0.5">Location</span>
                  <span className="font-medium">{obj.location}</span>
                </div>
              )}
            </div>

            {/* Short description */}
            <p className="text-gray-600 text-base leading-relaxed mb-6 border-l-4 pl-4" style={{ borderColor: "#FFD700" }}>
              {obj.short_description}
            </p>

            {/* Full description (markdown) */}
            {obj.full_description && (
              <MarkdownContent content={obj.full_description} />
            )}

            {/* Tags */}
            {obj.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-gray-200">
                {obj.tags.map(tag => (
                  <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Artist card */}
            {artistName && artistSlug && (
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">About the Artist</h3>
                {obj.artist?.profile_image_url && (
                  <div className="relative w-16 h-16 rounded-full overflow-hidden mb-3">
                    <Image src={obj.artist.profile_image_url} alt={artistName} fill className="object-cover" />
                  </div>
                )}
                <p className="font-semibold text-sm mb-1" style={{ color: "#1A1A2E" }}>{artistName}</p>
                {obj.artist?.born && (
                  <p className="text-xs mb-2" style={{ color: "#003399" }}>
                    {obj.artist.born}{obj.artist.died ? `–${obj.artist.died}` : ""}
                  </p>
                )}
                {obj.artist?.short_bio && (
                  <p className="text-xs text-gray-600 leading-relaxed mb-3 line-clamp-4">{obj.artist.short_bio}</p>
                )}
                <Link href={`/ukrainian-art/artists/${artistSlug}`} className="text-xs font-medium hover:underline" style={{ color: "#003399" }}>
                  View artist profile →
                </Link>
              </div>
            )}

            {/* Wave card */}
            {waveName && waveSlug && (
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Movement</h3>
                <p className="font-semibold text-sm mb-1" style={{ color: "#1A1A2E" }}>{waveName}</p>
                {obj.wave?.period && <p className="text-xs mb-2 font-mono" style={{ color: "#003399" }}>{obj.wave.period}</p>}
                {obj.wave?.description && (
                  <p className="text-xs text-gray-600 leading-relaxed mb-3 line-clamp-4">{obj.wave.description}</p>
                )}
                <Link href={`/ukrainian-art/waves/${waveSlug}`} className="text-xs font-medium hover:underline" style={{ color: "#003399" }}>
                  Explore movement →
                </Link>
              </div>
            )}
          </aside>
        </div>

        {/* Related works */}
        {related.length > 0 && (
          <section className="mt-16 pt-8 border-t border-gray-200">
            <h2 className="text-xl font-bold mb-6" style={{ color: "#1A1A2E" }}>Related Works</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {related.map(r => <ArtObjectCard key={r.id} obj={r} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
