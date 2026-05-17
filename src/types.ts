export type Region = 'Europe' | 'Indo-Pacific' | 'Middle East' | 'Americas' | 'Africa' | 'Global';

export interface Source {
  title: string;
  url: string;
  publisher: string;
  publishedAt: string;
  region: Region;
  topics: string[];
}

export interface ThreatScore {
  militaryEscalation: number;
  economicImpact: number;
  diplomaticImportance: number;
  humanitarianImpact: number;
  usPolicyRelevance: number;
  total: number;
  level: 'Low' | 'Guarded' | 'Elevated' | 'High' | 'Severe';
  explanation: string;
}

export interface Development {
  id: string;
  headline: string;
  summary: string;
  whyItMatters: string;
  whatToWatch: string;
  region: Region;
  score: ThreatScore;
  citations: Source[];
}

export interface Brief {
  id: string;
  date: string;
  title: string;
  executiveSummary: string;
  overallThreatScore: number;
  riskIndicators: string[];
  developments: Development[];
  regionalUpdates: Record<Region, string[]>;
  sources: Source[];
  generatedAt: string;
  analystNote: string;
}

export interface SubscriptionSettings {
  email: string;
  deliveryTime: string;
  regions: Region[];
  minimumThreatLevel: number;
}
