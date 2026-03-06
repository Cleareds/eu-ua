"use client";

import { useState } from "react";
import { QuizQuestion } from "@/lib/types";
import QuizClient from "./QuizClient";

interface Categories {
  general: QuizQuestion[];
  people: QuizQuestion[];
  places: QuizQuestion[];
  heritage: QuizQuestion[];
}

const CATEGORY_META = [
  {
    id: "general" as const,
    title: "General Knowledge",
    icon: "🌍",
    description: "EU integration, history, and Ukraine's European journey",
    color: "#003399",
  },
  {
    id: "people" as const,
    title: "Notable People",
    icon: "🎭",
    description: "Famous Ukrainians who shaped European culture and history",
    color: "#7e22ce",
  },
  {
    id: "places" as const,
    title: "Ukrainian Places",
    icon: "🗺️",
    description: "Cities, regions, rivers, and geography of Ukraine",
    color: "#166534",
  },
  {
    id: "heritage" as const,
    title: "Cultural Heritage",
    icon: "🏛️",
    description: "UNESCO sites, historic monuments, and wartime damage",
    color: "#c2410c",
  },
];

export default function QuizHub({ categories }: { categories: Categories }) {
  const [activeCategory, setActiveCategory] = useState<keyof Categories | null>(null);

  if (activeCategory) {
    return (
      <QuizClient
        questions={categories[activeCategory]}
        categoryTitle={CATEGORY_META.find((c) => c.id === activeCategory)!.title}
        categoryIcon={CATEGORY_META.find((c) => c.id === activeCategory)!.icon}
        onBack={() => setActiveCategory(null)}
      />
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="text-center mb-10">
        <div className="text-5xl mb-4">🧠</div>
        <h1 className="text-4xl font-bold mb-3" style={{ color: "#1A1A2E" }}>Ukraine & Europe Quiz</h1>
        <p className="text-gray-600 max-w-xl mx-auto">
          Choose a category and test your knowledge of Ukraine's history, people, places, and cultural heritage.
        </p>
      </div>

      {/* Category cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {CATEGORY_META.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className="text-left p-6 bg-white rounded-xl border-2 hover:shadow-md transition-all group"
            style={{ borderColor: "#E5E7EB" }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = cat.color)}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
          >
            <div className="text-3xl mb-3">{cat.icon}</div>
            <h2 className="font-bold text-lg mb-1" style={{ color: "#1A1A2E" }}>{cat.title}</h2>
            <p className="text-sm text-gray-500 mb-4">{cat.description}</p>
            <div className="flex items-center justify-between">
              <span
                className="text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ backgroundColor: cat.color + "15", color: cat.color }}
              >
                {categories[cat.id].length} questions
              </span>
              <span className="text-sm font-medium group-hover:translate-x-1 transition-transform inline-block" style={{ color: cat.color }}>
                Start →
              </span>
            </div>
          </button>
        ))}
      </div>

      <p className="text-center text-xs text-gray-400 mt-8">
        All questions are based on verified historical and factual sources.
      </p>
    </div>
  );
}
