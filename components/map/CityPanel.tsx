import { City, CulturalSite } from "@/lib/types";
import { ExternalLink } from "lucide-react";
import { DAMAGE_CONFIG } from "@/lib/constants";
import culturalSitesData from "@/data/cultural-sites.json";

const allSites = culturalSitesData as CulturalSite[];

export default function CityPanel({ city, onClose, onSelectSite }: { city: City; onClose: () => void; onSelectSite?: (site: CulturalSite) => void }) {
  const citySites = allSites.filter((s) => s.city === city.name);
  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b" style={{ backgroundColor: "#003399", color: "white" }}>
        <h2 className="text-xl font-bold">{city.name}</h2>
        <button
          onClick={onClose}
          className="p-1 rounded-md hover:bg-white/20 transition-colors"
          aria-label="Close panel"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* City image */}
        {city.image && (
          <div className="relative w-full h-40 rounded-lg overflow-hidden">
            <img
              src={city.image}
              alt={city.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Description */}
        <div>
          <p className="text-sm text-gray-700 leading-relaxed">{city.description}</p>
        </div>

        {/* European Influences */}
        {city.europeanInfluences.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#003399" }}>
              European Influences
            </h3>
            <ul className="space-y-2">
              {city.europeanInfluences.map((inf) => (
                <li key={inf} className="flex items-start gap-2 text-sm text-gray-700">
                  <span style={{ color: "#FFD700" }} className="mt-0.5 shrink-0">🏛️</span>
                  <span>{inf}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Connections */}
        {city.connections.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#003399" }}>
              European Connections
            </h3>
            <ul className="space-y-2">
              {city.connections.map((conn) => (
                <li key={conn} className="flex items-start gap-2 text-sm text-gray-700">
                  <span style={{ color: "#003399" }} className="mt-0.5 shrink-0">🔗</span>
                  <span>{conn}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Notable Figures */}
        {city.notableFigures.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#003399" }}>
              Notable Figures
            </h3>
            <ul className="space-y-2">
              {city.notableFigures.map((fig) => (
                <li key={fig} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="mt-0.5 shrink-0">👤</span>
                  <span>{fig}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Damaged Cultural Sites */}
        {citySites.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#cc0000" }}>
              Damaged Cultural Sites ({citySites.length})
            </h3>
            <div className="space-y-2">
              {citySites.map((site) => {
                const cfg = DAMAGE_CONFIG[site.damage];
                return (
                  <button
                    key={site.id}
                    onClick={() => onSelectSite?.(site)}
                    className="w-full text-left p-3 rounded-lg border hover:shadow-sm transition-all"
                    style={{ borderColor: "#E5E7EB" }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: cfg.dot }}
                      />
                      <span
                        className="text-xs font-semibold px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: cfg.bg, color: cfg.color }}
                      >
                        {cfg.label}
                      </span>
                      <span className="text-xs text-gray-400">{site.type}</span>
                    </div>
                    <p className="text-sm font-medium" style={{ color: "#1A1A2E" }}>{site.name}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Sources */}
        {city.sources && city.sources.length > 0 && (
          <div className="border-t pt-4" style={{ borderColor: "#E5E7EB" }}>
            <h3 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#6B7280" }}>
              Sources & Further Reading
            </h3>
            <ul className="space-y-2">
              {city.sources.map((source) => (
                <li key={source.url}>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-1.5 text-xs hover:underline"
                    style={{ color: "#003399" }}
                  >
                    <ExternalLink className="w-3 h-3 mt-0.5 shrink-0" />
                    <span>{source.title}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
