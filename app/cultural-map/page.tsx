import CulturalMap from "@/components/map/CulturalMap";

export const metadata = {
  title: "Cultural Map — EU-UA.com",
  description: "Explore Ukraine's cultural European connections across five major cities.",
};

export default function CulturalMapPage() {
  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 64px)" }}>
      {/* Header */}
      <div className="px-4 sm:px-6 lg:px-8 py-4 border-b bg-white flex items-center gap-4">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "#1A1A2E" }}>Cultural Map of Ukraine</h1>
          <p className="text-sm text-gray-500">Click a city to explore its European connections</p>
        </div>
      </div>

      {/* Map fills remaining height */}
      <div className="flex-1 overflow-hidden" style={{ isolation: "isolate" }}>
        <CulturalMap />
      </div>
    </div>
  );
}
