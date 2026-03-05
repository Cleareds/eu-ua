"use client";

import { useState } from "react";
import { Person } from "@/lib/types";
import { ExternalLink } from "lucide-react";

const ERA_LABELS: Record<string, string> = {
  medieval: "Medieval",
  "early-modern": "Early Modern",
  "national-awakening": "19th Century",
  modern: "Modern",
  "19th-century": "19th Century",
  "20th-century": "20th Century",
};

const ERA_COLORS: Record<string, { bg: string; text: string }> = {
  medieval:             { bg: "#F5F3FF", text: "#6d28d9" },
  "early-modern":       { bg: "#FFF7ED", text: "#c2410c" },
  "national-awakening": { bg: "#FDF4FF", text: "#7e22ce" },
  modern:               { bg: "#EFF6FF", text: "#1d4ed8" },
  "19th-century":       { bg: "#F0FDF4", text: "#166534" },
  "20th-century":       { bg: "#EFF6FF", text: "#003399" },
};

const ALL_ERAS = ["all", "medieval", "early-modern", "national-awakening", "19th-century", "20th-century", "modern"];

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

export default function PeopleGrid({ people }: { people: Person[] }) {
  const [activeEra, setActiveEra] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = activeEra === "all" ? people : people.filter((p) => p.era === activeEra);

  return (
    <div>
      {/* Era filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        {ALL_ERAS.map((era) => {
          const hasItems = era === "all" || people.some((p) => p.era === era);
          if (!hasItems) return null;
          return (
            <button
              key={era}
              onClick={() => setActiveEra(era)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border"
              style={
                activeEra === era
                  ? { backgroundColor: "#003399", color: "white", borderColor: "#003399" }
                  : { backgroundColor: "white", color: "#6B7280", borderColor: "#E5E7EB" }
              }
            >
              {era === "all" ? "All Periods" : (ERA_LABELS[era] ?? era)}
            </button>
          );
        })}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((person) => {
          const isExpanded = expandedId === person.id;
          const eraStyle = ERA_COLORS[person.era] ?? ERA_COLORS.modern;

          return (
            <div
              key={person.id}
              className="bg-white rounded-xl border shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow flex flex-col"
              style={{ borderColor: isExpanded ? "#003399" : "#E5E7EB" }}
              onClick={() => setExpandedId(isExpanded ? null : person.id)}
            >
              {/* Card header */}
              <div className="p-5 flex items-start gap-4">
                {/* Avatar */}
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                  style={{ backgroundColor: eraStyle.bg, color: eraStyle.text }}
                >
                  {getInitials(person.name)}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-sm leading-snug" style={{ color: "#1A1A2E" }}>{person.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{person.years}</p>
                  <p className="text-xs font-medium mt-0.5" style={{ color: eraStyle.text }}>{person.role}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{person.birthplace}</p>
                </div>
              </div>

              {/* Description (always shown briefly) */}
              <div className="px-5 pb-4">
                <p className={`text-xs text-gray-600 leading-relaxed ${isExpanded ? "" : "line-clamp-3"}`}>
                  {person.description}
                </p>
              </div>

              {/* Expanded section */}
              {isExpanded && (
                <div className="px-5 pb-5 border-t pt-4" style={{ borderColor: "#E5E7EB" }}>
                  <h4 className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#003399" }}>
                    European Connections
                  </h4>
                  <ul className="space-y-1.5 mb-4">
                    {person.europeanConnections.map((conn, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-gray-700">
                        <span className="mt-1 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: "#FFD700" }} />
                        {conn}
                      </li>
                    ))}
                  </ul>
                  <div className="space-y-1">
                    {person.sources.map((source) => (
                      <a
                        key={source.url}
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs hover:underline"
                        style={{ color: "#003399" }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="w-3 h-3 shrink-0" />
                        {source.title}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Expand indicator */}
              <div className="mt-auto px-5 py-2 border-t flex items-center justify-between" style={{ borderColor: "#F3F4F6" }}>
                <span className="text-xs text-gray-400">{person.europeanConnections.length} European connections</span>
                <svg
                  className="w-4 h-4 text-gray-400 transition-transform"
                  style={{ transform: isExpanded ? "rotate(180deg)" : "none" }}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-gray-400 mt-10 text-center">
        Profiles based on verified historical sources. Sources linked within each card.
      </p>
    </div>
  );
}
