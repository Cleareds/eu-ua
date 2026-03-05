import chaptersData from "@/data/euChapters.json";
import { EUChapter } from "@/lib/types";
import AccessionProgress from "@/components/accession/AccessionProgress";
import ChapterGrid from "@/components/accession/ChapterGrid";

export const metadata = {
  title: "EU Accession Progress — EU-UA.com",
  description: "Track Ukraine's progress across all 35 EU accession negotiation chapters.",
};

export default function EUAccessionPage() {
  const chapters = chaptersData as EUChapter[];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Page header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#003399" }}>
          🇪🇺 EU Integration
        </div>
        <h1 className="text-4xl font-bold mb-4" style={{ color: "#1A1A2E" }}>EU Accession Progress</h1>
        <p className="text-gray-600 max-w-2xl">
          Ukraine is negotiating membership across 35 chapters covering everything from trade and agriculture
          to judiciary reform and energy policy. Track progress below.
        </p>
      </div>

      <AccessionProgress chapters={chapters} />
      <ChapterGrid chapters={chapters} />
    </div>
  );
}
