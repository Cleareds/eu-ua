"use client";

import { useState } from "react";
import { TimelineEvent, TimelineEra } from "@/lib/types";
import { ExternalLink } from "lucide-react";
import { ERA_COLORS } from "@/lib/constants";

const ERA_LABELS: Record<string, string> = {
  ancient: "Ancient",
  medieval: "Medieval",
  "early-modern": "Early Modern",
  "national-awakening": "National Awakening",
  independence: "Independence Era",
  "eu-path": "Path to EU",
  modern: "Modern",
};

const TYPE_ICON: Record<string, string> = {
  cultural: "C",
  political: "P",
  military: "M",
  diplomatic: "D",
};

const TYPE_LABEL: Record<string, string> = {
  cultural: "Cultural",
  political: "Political",
  military: "Military",
  diplomatic: "Diplomatic",
};

const ALL_ERAS = ["all", "ancient", "medieval", "early-modern", "national-awakening", "independence", "eu-path"];

export default function TimelineView({ events }: { events: TimelineEvent[] }) {
  const [activeEra, setActiveEra] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = activeEra === "all" ? events : events.filter((e) => e.era === activeEra);

  // Group by era for display
  const grouped: Record<string, TimelineEvent[]> = {};
  for (const event of filtered) {
    if (!grouped[event.era]) grouped[event.era] = [];
    grouped[event.era].push(event);
  }

  const eraOrder = ["ancient", "medieval", "early-modern", "national-awakening", "independence", "eu-path", "modern"];
  const orderedEras = eraOrder.filter((era) => grouped[era]);

  return (
    <div>
      {/* Era filter */}
      <div className="flex flex-wrap gap-2 mb-10">
        {ALL_ERAS.map((era) => (
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
            {era === "all" ? "All Eras" : ERA_LABELS[era]}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-5 top-0 bottom-0 w-0.5" style={{ backgroundColor: "#E5E7EB" }} />

        <div className="space-y-10">
          {orderedEras.map((era) => (
            <div key={era}>
              {/* Era heading */}
              <div className="relative flex items-center mb-6">
                <div
                  className="absolute left-0 w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold z-10 border-2"
                  style={{ backgroundColor: ERA_COLORS[era]?.bg ?? "#F8F9FA", color: ERA_COLORS[era]?.text ?? "#374151", borderColor: ERA_COLORS[era]?.border ?? "#9ca3af" }}
                >
                  {ERA_LABELS[era]?.slice(0, 2).toUpperCase()}
                </div>
                <h2 className="ml-14 text-sm font-bold uppercase tracking-widest" style={{ color: ERA_COLORS[era]?.text ?? "#374151" }}>
                  {ERA_LABELS[era]}
                </h2>
              </div>

              {/* Events in era */}
              <div className="space-y-4 ml-14">
                {grouped[era].map((event) => {
                  const isExpanded = expandedId === event.id;
                  const eraStyle = ERA_COLORS[event.era] ?? ERA_COLORS.modern;
                  return (
                    <div key={event.id} className="relative">
                      {/* Dot on line */}
                      <div
                        className="absolute -left-9 top-4 w-3 h-3 rounded-full border-2 border-white"
                        style={{ backgroundColor: eraStyle.text }}
                      />

                      <div
                        className="bg-white rounded-xl border shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                        style={{ borderColor: isExpanded ? eraStyle.border : "#E5E7EB" }}
                        onClick={() => setExpandedId(isExpanded ? null : event.id)}
                      >
                        <div className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <span
                                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                                  style={{ backgroundColor: eraStyle.bg, color: eraStyle.text }}
                                >
                                  {event.year}
                                </span>
                                <span className="text-xs text-gray-400">{TYPE_LABEL[event.type]}</span>
                                {event.europeanConnection && (
                                  <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: "#EFF6FF", color: "#003399" }}>
                                    EU Connection
                                  </span>
                                )}
                              </div>
                              <h3 className="font-semibold text-sm leading-snug" style={{ color: "#1A1A2E" }}>
                                {event.title}
                              </h3>
                            </div>
                            <svg
                              className="w-4 h-4 shrink-0 text-gray-400 mt-1 transition-transform"
                              style={{ transform: isExpanded ? "rotate(180deg)" : "none" }}
                              fill="none" stroke="currentColor" viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="px-4 pb-4 border-t" style={{ borderColor: eraStyle.border }}>
                            <p className="text-sm text-gray-700 leading-relaxed mt-3 mb-3">{event.description}</p>
                            <a
                              href={event.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs hover:underline"
                              style={{ color: "#003399" }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <ExternalLink className="w-3 h-3" />
                              {event.sourceLabel}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-10 text-center">
        Events sourced from UNESCO, Wikipedia, academic publications, and verified historical records.
      </p>
    </div>
  );
}
