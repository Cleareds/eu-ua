import Hero from "@/components/home/Hero";
import Timeline from "@/components/home/Timeline";
import CulturalConnections from "@/components/home/CulturalConnections";
import DataInsightsPreview from "@/components/home/DataInsightsPreview";
import MythPreview from "@/components/home/MythPreview";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Timeline />
      <CulturalConnections />
      <DataInsightsPreview />
      <MythPreview />
    </>
  );
}
