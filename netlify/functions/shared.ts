import { createClient } from '@supabase/supabase-js';
import Parser from 'rss-parser';
import OpenAI from 'openai';
import { z } from 'zod';

export type Region = 'Europe' | 'Indo-Pacific' | 'Middle East' | 'Americas' | 'Africa' | 'Global';
export interface Source { title: string; url: string; publisher: string; publishedAt: string; region: Region; topics: string[]; }
export interface ThreatScore { militaryEscalation: number; economicImpact: number; diplomaticImportance: number; humanitarianImpact: number; usPolicyRelevance: number; total: number; level: 'Low'|'Guarded'|'Elevated'|'High'|'Severe'; explanation: string; }
export interface Development { id: string; headline: string; summary: string; whyItMatters: string; whatToWatch: string; region: Region; score: ThreatScore; citations: Source[]; }
export interface Brief { id: string; date: string; title: string; executiveSummary: string; overallThreatScore: number; riskIndicators: string[]; developments: Development[]; regionalUpdates: Record<Region, string[]>; sources: Source[]; generatedAt: string; analystNote: string; }

export const regions: Region[] = ['Europe','Indo-Pacific','Middle East','Americas','Africa','Global'];
export const topics = ['international relations','defense','conflict','elections','sanctions','cyberattack','energy security','NATO','Russia','China','Ukraine','Taiwan','Middle East','U.S. foreign policy'];
const rssFeeds = [
  'https://www.reutersagency.com/feed/?best-topics=world&post_type=best',
  'https://feeds.bbci.co.uk/news/world/rss.xml',
  'https://www.aljazeera.com/xml/rss/all.xml',
  'https://www.defense.gov/DesktopModules/ArticleCS/RSS.ashx?ContentType=1&Site=945&max=20',
  'https://www.nato.int/rss/news.xml',
  'https://www.cfr.org/rss.xml',
  'https://www.csis.org/rss.xml'
];

const developmentSchema = z.object({
  headline: z.string(), summary: z.string(), whyItMatters: z.string(), whatToWatch: z.string(), region: z.enum(['Europe','Indo-Pacific','Middle East','Americas','Africa','Global']),
  score: z.object({ militaryEscalation: z.number(), economicImpact: z.number(), diplomaticImportance: z.number(), humanitarianImpact: z.number(), usPolicyRelevance: z.number(), explanation: z.string() }),
  citationUrls: z.array(z.string()).min(1)
});

function json(body: unknown, statusCode = 200) { return { statusCode, headers: { 'content-type': 'application/json', 'access-control-allow-origin': '*' }, body: JSON.stringify(body, null, 2) }; }
export { json };

function regionFor(text: string): Region {
  const s = text.toLowerCase();
  if (/ukraine|russia|nato|europe|eu\b|poland|baltic|germany|france/.test(s)) return 'Europe';
  if (/china|taiwan|indo-pacific|japan|korea|philippines|south china sea|australia/.test(s)) return 'Indo-Pacific';
  if (/israel|gaza|iran|syria|lebanon|iraq|yemen|red sea|middle east/.test(s)) return 'Middle East';
  if (/united states|u\.s\.|us foreign|mexico|venezuela|brazil|canada/.test(s)) return 'Americas';
  if (/africa|sudan|sahel|niger|ethiopia|somalia|congo/.test(s)) return 'Africa';
  return 'Global';
}

function topicTags(text: string) { const lower = text.toLowerCase(); return topics.filter((t) => lower.includes(t.toLowerCase().replace('u.s.', 'u.s'))).slice(0, 5); }
function relevance(text: string) { const lower = text.toLowerCase(); return topics.reduce((n,t)=> n + (lower.includes(t.toLowerCase().replace('u.s.', 'u.s')) ? 1 : 0), 0) + (/war|missile|sanction|minister|election|attack|ceasefire|diplomat|military|energy|cyber/.test(lower) ? 1 : 0); }
function level(total: number): ThreatScore['level'] { if (total >= 4.25) return 'Severe'; if (total >= 3.5) return 'High'; if (total >= 2.75) return 'Elevated'; if (total >= 1.75) return 'Guarded'; return 'Low'; }
function clamp(n: number) { return Math.max(1, Math.min(5, Math.round(n))); }
function scoreArticle(source: Source): ThreatScore {
  const text = `${source.title} ${source.topics.join(' ')}`.toLowerCase();
  const militaryEscalation = clamp(1 + (/(missile|troop|military|nato|defense|attack|war|taiwan|ukraine|iran)/.test(text) ? 3 : 0) + (/ceasefire|border|strike/.test(text) ? 1 : 0));
  const economicImpact = clamp(1 + (/(energy|oil|gas|sanction|trade|shipping|red sea|semiconductor|cyber)/.test(text) ? 3 : 0));
  const diplomaticImportance = clamp(2 + (/(minister|summit|treaty|nato|united nations|u\.s\.|china|russia|election)/.test(text) ? 2 : 0));
  const humanitarianImpact = clamp(1 + (/(civilian|humanitarian|refugee|gaza|sudan|famine|casualties|aid)/.test(text) ? 3 : 0));
  const usPolicyRelevance = clamp(1 + (/(u\.s\.|united states|nato|china|russia|ukraine|taiwan|iran|sanction)/.test(text) ? 4 : 0));
  const total = Number(((militaryEscalation + economicImpact + diplomaticImportance + humanitarianImpact + usPolicyRelevance) / 5).toFixed(1));
  return { militaryEscalation, economicImpact, diplomaticImportance, humanitarianImpact, usPolicyRelevance, total, level: level(total), explanation: `Weighted equally across military escalation, economic impact, diplomatic importance, humanitarian impact, and relevance to U.S. foreign policy. Automated score from public-source article metadata; analyst review recommended before publication.` };
}

export async function collectNews(): Promise<Source[]> {
  const sources: Source[] = [];
  const parser = new Parser();
  const gdeltQuery = encodeURIComponent('(Russia OR China OR Ukraine OR Taiwan OR NATO OR sanctions OR cyberattack OR defense OR election OR "Middle East" OR "energy security")');
  const gdeltUrl = `https://api.gdeltproject.org/api/v2/doc/doc?query=${gdeltQuery}&mode=ArtList&format=json&maxrecords=40&sort=HybridRel`;
  try {
    const response = await fetch(gdeltUrl);
    if (response.ok) {
      const data = await response.json() as { articles?: Array<{ title?: string; url?: string; seendate?: string; sourceCountry?: string; domain?: string }> };
      for (const article of data.articles ?? []) {
        if (article.title && article.url) sources.push({ title: article.title, url: article.url, publisher: article.domain || 'GDELT-indexed source', publishedAt: article.seendate || new Date().toISOString(), region: regionFor(article.title), topics: topicTags(article.title) });
      }
    }
  } catch { /* GDELT fallback continues */ }

  if (process.env.NEWSAPI_KEY) {
    const q = encodeURIComponent('("international relations" OR defense OR conflict OR sanctions OR cyberattack OR NATO OR Russia OR China OR Ukraine OR Taiwan OR "Middle East" OR "U.S. foreign policy")');
    const url = `https://newsapi.org/v2/everything?q=${q}&language=en&sortBy=publishedAt&pageSize=40&apiKey=${process.env.NEWSAPI_KEY}`;
    try { const r = await fetch(url); const d = await r.json() as { articles?: Array<{ title?: string; url?: string; source?: { name?: string }; publishedAt?: string }> }; for (const a of d.articles ?? []) if (a.title && a.url) sources.push({ title: a.title, url: a.url, publisher: a.source?.name || 'NewsAPI source', publishedAt: a.publishedAt || new Date().toISOString(), region: regionFor(a.title), topics: topicTags(a.title) }); } catch { /* optional */ }
  }

  await Promise.allSettled(rssFeeds.map(async (feed) => {
    try { const parsed = await parser.parseURL(feed); for (const item of parsed.items.slice(0, 12)) { const title = item.title || ''; const url = item.link || feed; if (title) sources.push({ title, url, publisher: parsed.title || new URL(feed).hostname, publishedAt: item.isoDate || item.pubDate || new Date().toISOString(), region: regionFor(title), topics: topicTags(title) }); } } catch { /* ignore dead feed */ }
  }));

  const dedup = new Map<string, Source>();
  for (const s of sources) if (!dedup.has(s.url) && relevance(s.title) > 0) dedup.set(s.url, s);
  return [...dedup.values()].sort((a,b) => relevance(b.title) - relevance(a.title)).slice(0, 35);
}

async function writeWithOpenAI(sources: Source[]): Promise<Development[] | null> {
  if (!process.env.OPENAI_API_KEY) return null;
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  const compact = sources.slice(0, 20).map((s, i) => `${i+1}. ${s.title} | ${s.publisher} | ${s.publishedAt} | ${s.url}`).join('\n');
  const prompt = `Create exactly 5 analytical but conservative geopolitical developments from these public news sources. Do not add facts not supported by the titles/sources. Every item must cite at least one provided URL. Separate facts from analysis. Return JSON array only. Scoring dimensions 1-5: militaryEscalation, economicImpact, diplomaticImportance, humanitarianImpact, usPolicyRelevance.\n\nSources:\n${compact}`;
  const completion = await client.chat.completions.create({ model, temperature: 0.2, messages: [{ role: 'system', content: 'You are an intelligence brief editor using public sources only. No classified, hacked, leaked, or private data. Require citations.' }, { role: 'user', content: prompt }], response_format: { type: 'json_object' } });
  const text = completion.choices[0]?.message.content || '{}';
  const parsed = JSON.parse(text) as { developments?: unknown[] } | unknown[];
  const arr = Array.isArray(parsed) ? parsed : parsed.developments || [];
  return arr.slice(0,5).map((raw, index) => {
    const item = developmentSchema.parse(raw);
    const citations = item.citationUrls.map((url) => sources.find((s) => s.url === url)).filter(Boolean) as Source[];
    const fallbackCitation = citations.length ? citations : [sources[index]].filter(Boolean);
    const total = Number(((item.score.militaryEscalation + item.score.economicImpact + item.score.diplomaticImportance + item.score.humanitarianImpact + item.score.usPolicyRelevance) / 5).toFixed(1));
    return { id: `dev-${Date.now()}-${index}`, headline: item.headline, summary: item.summary, whyItMatters: item.whyItMatters, whatToWatch: item.whatToWatch, region: item.region, citations: fallbackCitation, score: { ...item.score, total, level: level(total) } };
  });
}

function extractiveDevelopments(sources: Source[]): Development[] {
  return sources.slice(0, 5).map((source, index) => {
    const score = scoreArticle(source);
    return { id: `dev-${Date.now()}-${index}`, headline: source.title, summary: `Public reporting from ${source.publisher} flags this as relevant to ${source.topics.join(', ') || 'international security and diplomacy'}.`, whyItMatters: `This item may affect ${source.region} security dynamics, diplomatic signaling, or policy priorities. The statement is analytical and should be read alongside the cited source.`, whatToWatch: 'Watch for official statements, corroborating reports from major outlets, sanctions or force posture announcements, and humanitarian indicators.', region: source.region, score, citations: [source] };
  });
}

export async function createBrief(): Promise<Brief> {
  const sources = await collectNews();
  const developments = (await writeWithOpenAI(sources).catch(() => null)) || extractiveDevelopments(sources);
  const allSources = developments.flatMap((d) => d.citations);
  const regionalUpdates = Object.fromEntries(regions.map((r) => [r, developments.filter((d) => d.region === r).map((d) => d.headline).slice(0, 3)])) as Record<Region, string[]>;
  for (const r of regions) if (!regionalUpdates[r].length) regionalUpdates[r] = ['No high-confidence development selected from the current public-source collection window.'];
  const overallThreatScore = developments.length ? Number((developments.reduce((sum, d) => sum + d.score.total, 0) / developments.length).toFixed(1)) : 1;
  const date = new Date().toISOString().slice(0,10);
  return { id: `brief-${date}-${Date.now()}`, date, title: 'Morning Intelligence Brief', executiveSummary: developments.length ? `Top public-source developments point to a ${level(overallThreatScore).toLowerCase()} overall risk environment. The highest-ranked items are driven by military escalation, diplomatic importance, economic exposure, humanitarian impact, and relevance to U.S. foreign policy.` : 'No current public-source items were collected. Check API/RSS connectivity.', overallThreatScore, riskIndicators: [...new Set(developments.flatMap((d) => d.citations.flatMap((s) => s.topics)).filter(Boolean))].slice(0, 6), developments, regionalUpdates, sources: allSources, generatedAt: new Date().toISOString(), analystNote: 'Generated from public sources only. Factual claims require citations; scoring is an analytical model, not a prediction.' };
}

export function supabaseAdmin() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export async function saveBrief(brief: Brief) {
  const supabase = supabaseAdmin();
  if (!supabase) return;
  await supabase.from('briefs').upsert({ id: brief.id, brief_date: brief.date, title: brief.title, threat_score: brief.overallThreatScore, payload: brief, generated_at: brief.generatedAt });
}

export function plainTextBrief(brief: Brief) {
  return `${brief.title} — ${brief.date}\nThreat score: ${brief.overallThreatScore}/5\n\nExecutive Summary\n${brief.executiveSummary}\n\nTop Developments\n${brief.developments.map((d, i) => `${i+1}. ${d.headline} (${d.region}, ${d.score.total}/5)\nWhy it matters: ${d.whyItMatters}\nSources: ${d.citations.map(c => c.url).join(', ')}`).join('\n\n')}\n\nAnalyst note: ${brief.analystNote}`;
}
