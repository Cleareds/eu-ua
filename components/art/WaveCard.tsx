import Link from "next/link";
import Image from "next/image";
import type { ArtWave } from "@/lib/types-art";

export default function WaveCard({ wave }: { wave: ArtWave }) {
  const period = wave.period ?? (wave.start_year
    ? `${wave.start_year}${wave.end_year ? `–${wave.end_year}` : "–present"}`
    : null);

  return (
    <Link
      href={`/ukrainian-art/waves/${wave.slug}`}
      className="group relative bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md hover:border-blue-100 transition-all"
    >
      {wave.cover_image_url && (
        <div className="relative h-32 overflow-hidden">
          <Image src={wave.cover_image_url} alt={wave.name} fill className="object-cover group-hover:scale-[1.02] transition-transform duration-300" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50" />
        </div>
      )}
      <div className={`p-5 ${wave.cover_image_url ? "" : "border-l-4"}`} style={wave.cover_image_url ? {} : { borderLeftColor: "#003399" }}>
        {period && (
          <span className="text-xs font-mono font-medium mb-1 block" style={{ color: "#003399" }}>{period}</span>
        )}
        <h3 className="font-bold text-base mb-2 group-hover:underline" style={{ color: "#1A1A2E" }}>{wave.name}</h3>
        <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{wave.description}</p>
        {wave.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {wave.tags.slice(0, 4).map(tag => (
              <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">{tag}</span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
