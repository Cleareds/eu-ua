import Link from "next/link";
import Image from "next/image";
import { artistLifespan } from "@/lib/art-utils";
import type { ArtArtist } from "@/lib/types-art";

export default function ArtistCard({ artist }: { artist: ArtArtist }) {
  return (
    <Link
      href={`/ukrainian-art/artists/${artist.slug}`}
      className="group flex flex-col bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md hover:border-blue-100 transition-all"
    >
      <div className="relative aspect-square bg-gray-100">
        {artist.profile_image_url ? (
          <Image
            src={artist.profile_image_url}
            alt={artist.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover object-top group-hover:scale-[1.02] transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-5xl text-gray-200">👤</div>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-semibold text-sm mb-0.5 group-hover:underline" style={{ color: "#1A1A2E" }}>
          {artist.name}
        </h3>
        {artist.born && (
          <p className="text-xs mb-2" style={{ color: "#003399" }}>
            {artistLifespan(artist.born, artist.died)}
          </p>
        )}
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 flex-1">{artist.short_bio}</p>
      </div>
    </Link>
  );
}
