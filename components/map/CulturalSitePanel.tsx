import { CulturalSite } from "@/lib/types";
import { ExternalLink } from "lucide-react";
import { DAMAGE_CONFIG } from "@/lib/constants";

export default function CulturalSitePanel({ site, onClose }: { site: CulturalSite; onClose: () => void }) {
  const badge = DAMAGE_CONFIG[site.damage] ?? DAMAGE_CONFIG.damaged;
  const dateFormatted = new Date(site.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between p-5 border-b gap-3" style={{ backgroundColor: "#7f0000", color: "white" }}>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest opacity-75 mb-1">{site.type} · {site.city}</p>
          <h2 className="text-lg font-bold leading-snug">{site.name}</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md hover:bg-white/20 transition-colors shrink-0 mt-0.5"
          aria-label="Close panel"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Status badge + date */}
        <div className="flex items-center gap-3 flex-wrap">
          <span
            className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide"
            style={{ backgroundColor: badge.bg, color: badge.color }}
          >
            {badge.label}
          </span>
          <span className="text-xs text-gray-500">{dateFormatted}</span>
        </div>

        {/* Image */}
        {site.image && (
          <div className="relative w-full h-36 rounded-lg overflow-hidden">
            <img src={site.image} alt={site.name} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Description */}
        <p className="text-sm text-gray-700 leading-relaxed">{site.description}</p>

        {/* Sources */}
        <div className="border-t pt-4" style={{ borderColor: "#E5E7EB" }}>
          <h3 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#6B7280" }}>
            Sources & Documentation
          </h3>
          <ul className="space-y-2">
            {site.sources.map((source) => (
              <li key={source.url}>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-1.5 text-xs hover:underline"
                  style={{ color: "#7f0000" }}
                >
                  <ExternalLink className="w-3 h-3 mt-0.5 shrink-0" />
                  <span>{source.title}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-gray-400 italic">
          All information is sourced from verified media reports, UN agencies, UNESCO, and human rights organisations.
        </p>
      </div>
    </div>
  );
}
