"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import SourceModal from "@/components/ui/source-modal";
import type { TradeDataPoint } from "@/lib/types";

const sources = [
  { label: "VoxUkraine — Student Migration to Western Universities 2008–2023", url: "https://voxukraine.org/en/student-migration-to-western-universities-how-many-ukrainians-left-between-2008-and-2023-and-w", description: "Longitudinal data on Ukrainian students at EU universities" },
  { label: "UNESCO — Education for Ukrainian refugee learners in Europe", url: "https://www.unesco.org/en/ukraine-war/education", description: "UNESCO tracking of Ukrainian learners in host countries" },
  { label: "UNHCR — Progress and challenges for Ukrainian refugee students in Europe", url: "https://www.unhcr.org/europe/news/announcements/new-data-insights-reveal-both-progress-and-challenges-ukrainian-refugee-students", description: "UNHCR data on school-age Ukrainian learners in EU (664K in 2024)" },
  { label: "Erasmus+ / EACEA", url: "https://erasmus-plus.ec.europa.eu/", description: "EU agency tracking Erasmus+ mobility statistics" },
];

export default function StudentsChart({ data }: { data: TradeDataPoint[] }) {
  const chartData = data.map((d) => ({ ...d, value: Math.round(d.value / 1000) }));

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
      <div className="flex items-start justify-between mb-1 gap-2">
        <h3 className="font-bold text-base" style={{ color: "#1A1A2E" }}>Ukrainian Students & Learners in EU</h3>
        <SourceModal title="Ukrainian Students & Learners in EU" sources={sources} note="Includes university-enrolled students, Erasmus+ participants, and school-age learners in EU host country schools. Post-2022 surge reflects both wartime displacement and growing educational mobility." />
      </div>
      <p className="text-xs text-gray-400 mb-4">Thousands of Ukrainians enrolled in EU educational institutions (UNESCO, UNHCR, Eurostat)</p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} role="img" aria-label="Bar chart showing the number of Ukrainian students and learners enrolled in EU educational institutions over time, measured in thousands.">
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
          <XAxis dataKey="year" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} unit="K" />
          <Tooltip formatter={(v) => [`${v}K students`, "Ukraine → EU"]} />
          <Bar dataKey="value" fill="#003399" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
