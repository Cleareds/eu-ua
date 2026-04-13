import { EUChapter, ChapterStatus } from "@/lib/types";
import { CHAPTER_STATUS } from "@/lib/constants";

const statusOrder: ChapterStatus[] = ["completed", "negotiation", "dcp_received", "screening_completed", "screening", "not_started"];

export default function AccessionProgress({ chapters }: { chapters: EUChapter[] }) {
  const counts = chapters.reduce((acc, ch) => {
    acc[ch.status] = (acc[ch.status] || 0) + 1;
    return acc;
  }, {} as Record<ChapterStatus, number>);

  const completed = counts.completed || 0;
  const negotiation = counts.negotiation || 0;
  const dcpReceived = counts.dcp_received || 0;
  const screeningCompleted = counts.screening_completed || 0;
  const screening = counts.screening || 0;
  const notStarted = counts.not_started || 0;
  const total = chapters.length;

  const progressPct = Math.round(
    ((completed + negotiation * 0.7 + dcpReceived * 0.5 + screeningCompleted * 0.3 + screening * 0.15) / total) * 100
  );

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
      <h2 className="font-bold text-lg mb-4" style={{ color: "#1A1A2E" }}>Overall Accession Progress</h2>

      {/* Progress bar */}
      <div className="flex h-4 rounded-full overflow-hidden gap-0.5 mb-4 bg-gray-100">
        {statusOrder.map((status) => {
          const count = counts[status] || 0;
          const pct = (count / total) * 100;
          if (pct === 0) return null;
          return (
            <div
              key={status}
              style={{ width: `${pct}%`, backgroundColor: CHAPTER_STATUS[status].color }}
              title={`${CHAPTER_STATUS[status].label}: ${count}`}
            />
          );
        })}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-2">
        {[
          { label: "DCP Received", count: dcpReceived, color: CHAPTER_STATUS.dcp_received.color },
          { label: "Screened", count: screeningCompleted, color: CHAPTER_STATUS.screening_completed.color },
          { label: "Negotiation", count: negotiation + completed, color: CHAPTER_STATUS.negotiation.color },
        ].filter((s) => s.count > 0 || s.label === "Negotiation").map((s) => (
          <div key={s.label} className="text-center">
            <div className="text-2xl font-bold" style={{ color: s.color }}>{s.count}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs text-gray-400 text-center">
        {total} total chapters · All screening completed Sep 2025 · ~{progressPct}% weighted progress
      </p>
    </div>
  );
}
