import peopleData from "@/data/people.json";
import { Person } from "@/lib/types";
import PeopleGrid from "@/components/people/PeopleGrid";

export const metadata = {
  title: "Notable Ukrainians with European Connections — EU-UA",
  description: "Discover Ukrainian figures who shaped European culture, science, and history — from Yaroslav the Wise who married his children to European royalty, to Paul Celan, one of the greatest German-language poets.",
  openGraph: {
    title: "Ukrainians Who Shaped Europe",
    description: "12 notable Ukrainians whose lives and work left an indelible mark on European culture, science, diplomacy, and art.",
  },
  keywords: ["Ukrainian notable figures", "Ukraine Europe culture", "Yaroslav the Wise Europe", "Ukrainian scientists Europe", "Ukrainian artists Europe"],
};

export default function PeoplePage() {
  const people = peopleData as Person[];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F8F9FA" }}>
      {/* Header */}
      <div className="text-white py-14 px-4" style={{ backgroundColor: "#003399" }}>
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3 opacity-75">European Connections</p>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Ukrainians Who Shaped Europe</h1>
          <p className="text-lg opacity-80 max-w-2xl mx-auto">
            Scientists, poets, rulers, and artists — Ukrainians have been part of the European story for centuries.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <PeopleGrid people={people} />
      </div>
    </div>
  );
}
