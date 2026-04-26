import Link from "next/link";
import Image from "next/image";
import type { ArtObject } from "@/lib/types-art";

export default function ArtObjectCard({ obj }: { obj: ArtObject }) {
  const artistName = typeof obj.artist === "object" && obj.artist ? obj.artist.name : null;
  const artistSlug = typeof obj.artist === "object" && obj.artist ? obj.artist.slug : null;

  return (
    <Link
      href={`/ukrainian-art/art/${obj.slug}`}
      className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md hover:border-blue-100 transition-all"
    >
      <div className="relative aspect-[4/3] bg-gray-50">
        {obj.image_url ? (
          <Image
            src={obj.image_url}
            alt={obj.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-4xl text-gray-200">🖼</div>
        )}
        {obj.year && (
          <div className="absolute bottom-2 right-2 text-xs px-2 py-0.5 rounded font-mono bg-black/60 text-white">
            {obj.year}
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-sm leading-snug mb-1 group-hover:underline" style={{ color: "#1A1A2E" }}>
          {obj.title}
        </h3>
        {artistName && (
          <p className="text-xs mb-2" style={{ color: "#003399" }}>
            {artistName}
          </p>
        )}
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{obj.short_description}</p>
        {obj.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {obj.tags.slice(0, 3).map(tag => (
              <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
