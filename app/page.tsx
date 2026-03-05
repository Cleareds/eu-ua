import type { Metadata } from "next";
import Hero from "@/components/home/Hero";
import Timeline from "@/components/home/Timeline";
import CulturalConnections from "@/components/home/CulturalConnections";
import DataInsightsPreview from "@/components/home/DataInsightsPreview";
import MythPreview from "@/components/home/MythPreview";
import { getNews, getEUData, getMyths } from "@/lib/data";

export const metadata: Metadata = {
  title: "Ukraine & Europe — EU-UA.com",
  description: "Explore Ukraine's deep European roots, track EU accession across 35 chapters, and discover cultural connections between Ukraine and Europe.",
  openGraph: {
    title: "Ukraine & Europe — EU-UA.com",
    description: "Explore Ukraine's deep European roots, track EU accession across 35 chapters, and discover cultural connections.",
  },
};

export default async function HomePage() {
  const [news, euData, myths] = await Promise.all([getNews(3), getEUData(), getMyths()]);

  return (
    <>
      <Hero />
      <Timeline recentNews={news} />
      <CulturalConnections />
      <DataInsightsPreview data={euData} />
      <MythPreview myth={myths[0]} />
    </>
  );
}
