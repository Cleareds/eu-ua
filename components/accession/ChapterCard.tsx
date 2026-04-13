import { EUChapter } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CHAPTER_STATUS } from "@/lib/constants";

export default function ChapterCard({ chapter }: { chapter: EUChapter }) {
  const status = CHAPTER_STATUS[chapter.status];
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-bold text-gray-400 shrink-0">Ch. {chapter.id}{chapter.cluster ? ` · C${chapter.cluster}` : ""}</span>
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
