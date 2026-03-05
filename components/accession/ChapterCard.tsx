import { EUChapter, ChapterStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const statusConfig: Record<ChapterStatus, { label: string; color: string; bg: string }> = {
  not_started: { label: "Not Started", color: "#6B7280", bg: "#F3F4F6" },
  screening: { label: "Screening", color: "#D97706", bg: "#FEF3C7" },
  negotiation: { label: "Negotiation", color: "#2563EB", bg: "#DBEAFE" },
  completed: { label: "Completed", color: "#059669", bg: "#D1FAE5" },
};

export default function ChapterCard({ chapter }: { chapter: EUChapter }) {
  const status = statusConfig[chapter.status];
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-bold text-gray-400 shrink-0">Ch. {chapter.id}</span>
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded-full shrink-0"
          style={{ color: status.color, backgroundColor: status.bg }}
        >
          {status.label}
        </span>
      </div>
      <h3 className="font-semibold text-sm leading-snug" style={{ color: "#1A1A2E" }}>
        {chapter.name}
      </h3>
      <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">{chapter.description}</p>
    </div>
  );
}
