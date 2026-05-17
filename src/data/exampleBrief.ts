import type { Brief } from '../types';

export const exampleBrief: Brief = {
  id: 'demo-brief-2026-05-16',
  date: '2026-05-16',
  title: 'Morning Intelligence Brief',
  executiveSummary: 'This demo brief shows the product format using clearly labeled sample content. Production briefs are generated from public news APIs/RSS and require citations for every development.',
  overallThreatScore: 3.4,
  riskIndicators: ['Military posture changes', 'Sanctions activity', 'Energy market sensitivity', 'Election-related diplomatic risk'],
  analystNote: 'Demo data only. Do not treat this as current intelligence.',
  generatedAt: new Date().toISOString(),
  developments: [
    {
      id: 'demo-1',
      headline: 'NATO allies review deterrence posture after regional escalation signals',
      region: 'Europe',
      summary: 'Public reporting indicates alliance officials are monitoring deterrence posture and diplomatic signaling in Europe.',
      whyItMatters: 'NATO posture changes can alter escalation dynamics, procurement priorities, and U.S. force planning.',
      whatToWatch: 'Watch formal communiqués, force posture announcements, and allied defense spending statements.',
      score: { militaryEscalation: 4, economicImpact: 2, diplomaticImportance: 5, humanitarianImpact: 2, usPolicyRelevance: 5, total: 3.6, level: 'High', explanation: 'High diplomatic and U.S. policy relevance with moderate military escalation risk.' },
      citations: [{ title: 'Demo citation: NATO press releases', url: 'https://www.nato.int/cps/en/natohq/news.htm', publisher: 'NATO', publishedAt: new Date().toISOString(), region: 'Europe', topics: ['NATO', 'defense'] }]
    },
    {
      id: 'demo-2',
      headline: 'Indo-Pacific governments assess maritime and Taiwan Strait risk indicators',
      region: 'Indo-Pacific',
      summary: 'Regional governments continue to track maritime activity, defense exercises, and political signaling around Taiwan and nearby sea lanes.',
      whyItMatters: 'Taiwan Strait or maritime incidents could affect global trade, semiconductor supply chains, and U.S. alliance commitments.',
      whatToWatch: 'Watch official defense ministry releases, exercise notices, and coast guard activity statements.',
      score: { militaryEscalation: 5, economicImpact: 5, diplomaticImportance: 5, humanitarianImpact: 3, usPolicyRelevance: 5, total: 4.6, level: 'Severe', explanation: 'Potentially severe due to military, economic, diplomatic, and U.S. policy stakes.' },
      citations: [{ title: 'Demo citation: Taiwan Ministry of National Defense', url: 'https://www.mnd.gov.tw/english/', publisher: 'MND Taiwan', publishedAt: new Date().toISOString(), region: 'Indo-Pacific', topics: ['Taiwan', 'defense'] }]
    }
  ],
  regionalUpdates: {
    Europe: ['Demo: NATO posture and Ukraine-related sanctions remain priority watch items.'],
    'Indo-Pacific': ['Demo: Taiwan Strait and South China Sea risk indicators are elevated.'],
    'Middle East': ['Demo: Monitor ceasefire diplomacy, energy infrastructure security, and humanitarian indicators.'],
    Americas: ['Demo: U.S. foreign policy and election-cycle diplomacy shape global reactions.'],
    Africa: ['Demo: Track conflict, coups, election integrity, and food security pressures.'],
    Global: ['Demo: Cyberattacks, energy markets, and sanctions enforcement remain cross-regional concerns.']
  },
  sources: [
    { title: 'NATO Newsroom', url: 'https://www.nato.int/cps/en/natohq/news.htm', publisher: 'NATO', publishedAt: new Date().toISOString(), region: 'Europe', topics: ['NATO'] },
    { title: 'GDELT Project', url: 'https://www.gdeltproject.org/', publisher: 'GDELT', publishedAt: new Date().toISOString(), region: 'Global', topics: ['public news data'] }
  ]
};
