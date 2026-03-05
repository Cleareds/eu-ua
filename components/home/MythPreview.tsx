"use client";

import { useState } from "react";
import Link from "next/link";
import type { Myth } from "@/lib/types";

export default function MythPreview({ myth }: { myth: Myth }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: "#F0F4FF" }}>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: "#1A1A2E" }}>Myths & Reality</h2>
          <p className="text-gray-600">Common misconceptions about Ukraine and Europe, fact-checked with sources.</p>
        </div>

        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
          <div className="p-6 border-l-4" style={{ borderLeftColor: "#DC2626" }}>
            <div className="text-xs font-semibold uppercase tracking-widest text-red-600 mb-2">Common Myth</div>
            <p className="font-semibold text-lg" style={{ color: "#1A1A2E" }}>{myth.myth}</p>
          </div>

          <div className="p-6 border-t border-gray-50">
            <div className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#003399" }}>Reality</div>
            <p className="text-gray-700 text-sm leading-relaxed">
              {expanded ? myth.reality : myth.reality.slice(0, 200) + "..."}
            </p>
            <button onClick={() => setExpanded(!expanded)} className="mt-3 text-sm font-medium transition-colors" style={{ color: "#003399" }}>
              {expanded ? "Show less ↑" : "Read full explanation ↓"}
            </button>

            {expanded && myth.sources.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="text-xs text-gray-500 mb-2">Sources:</div>
                <ul className="space-y-1">
                  {myth.sources.map((s) => (
                    <li key={s.url} className="text-xs">
                      <a href={s.url} target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: "#003399" }}>{s.title} →</a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="text-center mt-8">
          <Link href="/myths" className="inline-flex items-center gap-2 text-sm font-semibold transition-colors" style={{ color: "#003399" }}>
            See all myths debunked →
          </Link>
        </div>
      </div>
    </section>
  );
}
