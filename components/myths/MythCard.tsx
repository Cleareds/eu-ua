"use client";

import { useState } from "react";
import { Myth } from "@/lib/types";

export default function MythCard({ myth }: { myth: Myth }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Myth */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left p-6 border-l-4"
        style={{ borderLeftColor: "#DC2626" }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-red-500 mb-2">Common Myth #{myth.id}</div>
            <p className="font-semibold text-base leading-snug" style={{ color: "#1A1A2E" }}>
              {myth.myth}
            </p>
          </div>
          <span className="shrink-0 text-gray-400 mt-1 transition-transform" style={{ transform: open ? "rotate(180deg)" : "rotate(0)" }}>
            ▼
          </span>
        </div>
      </button>

      {/* Reality */}
      {open && (
        <div className="border-t border-gray-50">
          <div className="p-6 border-l-4" style={{ borderLeftColor: "#059669" }}>
            <div className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#059669" }}>Reality</div>
            <p className="text-sm text-gray-700 leading-relaxed">{myth.reality}</p>
          </div>

          {myth.sources.length > 0 && (
            <div className="px-6 pb-6 border-l-4" style={{ borderLeftColor: "#059669" }}>
              <div className="text-xs text-gray-400 mb-2 font-medium">Sources:</div>
              <ul className="space-y-1">
                {myth.sources.map((s) => (
                  <li key={s.url}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs hover:underline"
                      style={{ color: "#003399" }}
                    >
                      {s.title} →
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
