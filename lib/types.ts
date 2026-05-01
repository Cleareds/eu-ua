export type ChapterStatus = "not_started" | "screening" | "screening_completed" | "dcp_received" | "negotiation" | "completed";

export interface EUChapter {
  id: number;
  name: string;
  status: ChapterStatus;
  cluster?: number;
  clusterName?: string;
  description: string;
}

export interface CitySource {
  title: string;
  url: string;
}

export type CityStatus = "free" | "occupied" | "liberated";

export interface City {
  id: string;
  name: string;
  lat: number;
  lng: number;
  description: string;
  connections: string[];
  notableFigures: string[];
  europeanInfluences: string[];
  sources: CitySource[];
  image?: string;
  status?: CityStatus;
  occupiedSince?: string;
}

export type SiteDamage = "destroyed" | "severely_damaged" | "damaged";

export interface CulturalSite {
  id: string;
  name: string;
  city: string;
  lat: number;
  lng: number;
  type: string;
  description: string;
  damage: SiteDamage;
  date: string;
  image?: string;
  sources: CitySource[];
}

export type DiasporaCategory = "church" | "monument" | "memorial" | "museum" | "education" | "cultural_centre" | "manuscript" | "unesco";

export interface DiasporaHeritageSite {
  id: string;
  name: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  category: DiasporaCategory;
  ukrainianConnection: string;
  description: string;
  image?: string;
  sources: CitySource[];
}

export interface TradeDataPoint {
  year: number;
  value: number;
}

export interface EUUkraineData {
  tradeShare: TradeDataPoint[];
  students: TradeDataPoint[];
  assistance: TradeDataPoint[];
  tradeGrowth: TradeDataPoint[];
}

export interface MythSource {
  title: string;
  url: string;
}

export interface Myth {
  id: number;
  myth: string;
  reality: string;
  sources: MythSource[];
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export interface NewsItem {
  date: string;
  headline: string;
  summary: string;
  source: string;
  url: string;
}

export interface TimelineMilestone {
  year: string;
  title: string;
  description: string;
}

export type TimelineEra = "ancient" | "medieval" | "early-modern" | "national-awakening" | "independence" | "eu-path" | "modern";
export type TimelineType = "cultural" | "political" | "military" | "diplomatic";

export interface TimelineEvent {
  id: string;
  year: string;
  yearSort: number;
  title: string;
  description: string;
  era: TimelineEra;
  type: TimelineType;
  europeanConnection: boolean;
  sourceLabel: string;
  sourceUrl: string;
}

export interface PersonSource {
  title: string;
  url: string;
}

export type PersonEra = "medieval" | "early-modern" | "modern" | "19th-century" | "20th-century";

export interface Person {
  id: string;
  name: string;
  years: string;
  role: string;
  birthplace: string;
  era: PersonEra | string;
  description: string;
  europeanConnections: string[];
  sources: PersonSource[];
  profileImageUrl?: string | null;
}

/** DB-shape Person record (snake_case columns). */
export interface PersonRecord {
  id: string;
  slug: string;
  name: string;
  years: string | null;
  role: string | null;
  birthplace: string | null;
  era: string | null;
  description: string;
  european_connections: string[];
  sources: PersonSource[];
  profile_image_url: string | null;
  display_order: number | null;
  featured: boolean;
  published: boolean;
  created_at: string;
  updated_at: string;
}
