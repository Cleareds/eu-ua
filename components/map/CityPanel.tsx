import { City } from "@/lib/types";

export default function CityPanel({ city, onClose }: { city: City; onClose: () => void }) {
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
      </div>
    </div>
  );
}
