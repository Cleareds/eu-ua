import HeritageTracker from "@/components/heritage/HeritageTracker";

export const metadata = {
  title: "Ukraine Cultural Heritage Damage Tracker — EU-UA",
  description: "Documented Russian attacks on Ukrainian cultural heritage since 2022 — theatres, museums, monasteries, universities. Over 350 sites verified by UNESCO.",
  openGraph: {
    title: "Ukraine's Destroyed Heritage",
    description: "Documented attacks on Ukrainian museums, theatres, monasteries, and historic sites — tracked and sourced from UNESCO, HRW, and AP investigations.",
  },
  keywords: ["Ukraine cultural heritage destroyed", "Ukraine museums bombed", "Mariupol theatre", "UNESCO Ukraine", "Russia Ukraine culture war"],
};

export default function HeritagePage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F8F9FA" }}>
      <HeritageTracker />
    </div>
  );
}
