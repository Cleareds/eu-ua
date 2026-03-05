"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import euData from "@/data/euUkraineData.json";

export default function StudentsChart() {
  const data = euData.students.map((d) => ({ ...d, value: Math.round(d.value / 1000) }));

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
      <h3 className="font-bold text-base mb-1" style={{ color: "#1A1A2E" }}>Ukrainian Students in EU</h3>
      <p className="text-xs text-gray-400 mb-4">Thousands of Ukrainian students enrolled in EU universities</p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
          <XAxis dataKey="year" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} unit="K" />
          <Tooltip formatter={(v) => [`${v}K students`, "Ukraine → EU"]} />
          <Bar dataKey="value" fill="#003399" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <p className="text-xs text-gray-400 mt-3">Source: Eurostat / EACEA — includes Erasmus+ and displaced students</p>
    </div>
  );
}
