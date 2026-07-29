import { getChapters } from "@/lib/data";
import AccessionProgress from "@/components/accession/AccessionProgress";
import ChapterGrid from "@/components/accession/ChapterGrid";
import SourceModal from "@/components/ui/source-modal";

export const metadata = {
  title: "Ukraine EU Accession Progress — All 35 Chapters",
  description: "Track Ukraine's EU accession negotiations across all 35 chapters. Screening completed September 2025. Live status: completed, negotiation, screening phases.",
  openGraph: {
    title: "Ukraine EU Accession Progress — All 35 Chapters",
    description: "Live tracker: Ukraine's progress across all 35 EU accession negotiation chapters as of 2026.",
  },
  keywords: ["Ukraine EU accession chapters", "Ukraine EU negotiations 2026", "Ukraine EU membership progress", "35 chapters EU Ukraine"],
};

const sources = [
  { label: "European Commission — Ukraine's Path Towards EU Accession", url: "https://commission.europa.eu/topics/eu-solidarity-ukraine/ukraines-path-towards-eu-accession_en", description: "Official EC page tracking accession progress" },
  { label: "EC Enlargement — Ukraine", url: "https://enlargement.ec.europa.eu/countries/ukraine_en", description: "Detailed chapter-by-chapter progress reports" },
  { label: "Wikipedia — Accession of Ukraine to the European Union", url: "https://en.wikipedia.org/wiki/Accession_of_Ukraine_to_the_European_Union", description: "Comprehensive timeline and current status" },
  { label: "Promote Ukraine — EU Accession Policy Priorities 2026", url: "https://www.promoteukraine.org/ukraines-eu-accession-policy-priorities-for-advocacy-in-2026/", description: "2026 advocacy priorities and chapter status overview" },
];

export default async function EUAccessionPage() {
  const chapters = await getChapters();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#003399" }}>
          🇪🇺 EU Integration
        </div>
        <div className="flex items-start gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <h1 className="text-4xl font-bold mb-4" style={{ color: "#1A1A2E" }}>EU Accession Progress</h1>
            <p className="text-gray-600 max-w-2xl">
              Ukraine is negotiating membership across 35 chapters covering everything from trade and agriculture
              to judiciary reform and energy policy. Screening completed in September 2025. Two of the six
              negotiating clusters are now open — Fundamentals since 15 June 2026 and External Relations since
              14 July 2026 — while clusters 2 to 5 wait on Hungary approving their screening results, next on
              the Council&apos;s agenda on 1 September 2026.
            </p>
          </div>
          <div className="pt-2">
            <SourceModal title="EU Accession Chapter Data" sources={sources} note="Chapter statuses reflect publicly reported progress as of late July 2026. This is an independent summary — always check official EC progress reports for authoritative status." />
          </div>
        </div>
      </div>

      <AccessionProgress chapters={chapters} />
      <ChapterGrid chapters={chapters} />
    </div>
  );
}
