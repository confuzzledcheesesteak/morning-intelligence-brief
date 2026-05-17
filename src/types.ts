export type Region = 'Europe' | 'Middle East' | 'Indo-Pacific' | 'Americas' | 'Africa' | 'Global';

export interface SourceCitation { title: string; outlet: string; url: string; publishedAt?: string; }
export interface Development {
  id: string; title: string; region: Region; factualSummary: string; analysis: string; whyItMatters: string; whatToWatch: string[]; citations: SourceCitation[];
  threat: { score: number; label: string; explanation: string; factors: { militaryEscalation: number; economicImpact: number; diplomaticImportance: number; humanitarianImpact: number; usForeignPolicyRelevance: number; }; };
}
export interface Brief {
  id: string; date: string; title: string; executiveSummary: string; overallThreatScore: number; topDevelopments: Development[]; regionUpdates: Record<Region, string[]>; sources: SourceCitation[]; generatedAt: string; pdfUrl?: string;
}
export interface SubscriberSettings { email: string; deliveryTime: string; regionFilters: Region[]; darkMode: boolean; }
