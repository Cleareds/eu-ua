export type ChapterStatus = "not_started" | "screening" | "negotiation" | "completed";

export interface EUChapter {
  id: number;
  name: string;
  status: ChapterStatus;
  description: string;
}

export interface City {
  id: string;
  name: string;
  lat: number;
  lng: number;
  description: string;
  connections: string[];
  notableFigures: string[];
  europeanInfluences: string[];
}

export interface TradeDataPoint {
  year: number;
  value: number;
}

export interface EUUkraineData {
  tradeShare: TradeDataPoint[];
  students: TradeDataPoint[];
  assistance: TradeDataPoint[];
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
