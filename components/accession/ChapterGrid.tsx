"use client";

import { useState } from "react";
import { EUChapter, ChapterStatus } from "@/lib/types";
import ChapterCard from "./ChapterCard";

const tabs: { label: string; value: ChapterStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Not Started", value: "not_started" },
  { label: "Screening", value: "screening" },
  { label: "Negotiation", value: "negotiation" },
  { label: "Completed", value: "completed" },
];

const tabActiveColors: Record<string, { bg: string; color: string }> = {
  all: { bg: "#003399", color: "white" },
  not_started: { bg: "#F3F4F6", color: "#6B7280" },
  screening: { bg: "#FEF3C7", color: "#D97706" },
  negotiation: { bg: "#DBEAFE", color: "#2563EB" },
  completed: { bg: "#D1FAE5", color: "#059669" },
};

export default function ChapterGrid({ chapters }: { chapters: EUChapter[] }) {
  const [activeTab, setActiveTab] = useState<ChapterStatus | "all">("all");

  const filtered = activeTab === "all" ? chapters : chapters.filter((c) => c.status === activeTab);

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.value;
          const colors = tabActiveColors[tab.value];
          const count = tab.value === "all" ? chapters.length : chapters.filter((c) => c.status === tab.value).length;
          return (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className="px-4 py-2 rounded-full text-sm font-medium transition-all border"
              style={
                isActive
                  ? { backgroundColor: colors.bg, color: colors.color, borderColor: colors.bg }
                  : { backgroundColor: "white", color: "#6B7280", borderColor: "#E5E7EB" }
              }
            >
              {tab.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((chapter) => (
          <ChapterCard key={chapter.id} chapter={chapter} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-400">No chapters in this category yet.</div>
      )}
    </div>
  );
}
