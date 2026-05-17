import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import PDFDocument from 'pdfkit';
import type { HandlerResponse } from '@netlify/functions';

type Article = { title:string; url:string; source:string; publishedAt?:string; description?:string; content?:string; region?:string };
const queryTerms = ['international relations','defense','conflict','elections','sanctions','cyberattack','energy security','NATO','Russia','China','Ukraine','Taiwan','Middle East','U.S. foreign policy'];
const rssFeeds = ['https://www.nato.int/cps/en/natohq/news.xml','https://news.un.org/feed/subscribe/en/news/region/middle-east/feed/rss.xml','https://www.cisa.gov/news.xml'];
export const json = (statusCode:number, body:unknown): HandlerResponse => ({ statusCode, headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'}, body:JSON.stringify(body) });
export function supabaseAdmin(){ if(!process.env.SUPABASE_URL||!process.env.SUPABASE_SERVICE_ROLE_KEY) return null; return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY); }
function regionFor(text:string){ const t=text.toLowerCase(); if(/ukraine|russia|nato|europe/.test(t)) return 'Europe'; if(/israel|gaza|iran|syria|iraq|middle east|red sea/.test(t)) return 'Middle East'; if(/china|taiwan|japan|korea|philippines|indo-pacific/.test(t)) return 'Indo-Pacific'; if(/united states|u\.s\.|mexico|canada|venezuela|america/.test(t)) return 'Americas'; if(/africa|sudan|sahel|niger|ethiopia|somalia/.test(t)) return 'Africa'; return 'Global'; }
export async function collectNews(): Promise<Article[]> {
  const articles: Article[] = [];
  if(process.env.NEWSAPI_KEY){
    const q=encodeURIComponent(queryTerms.join(' OR '));
    const url=`https://newsapi.org/v2/everything?q=${q}&language=en&sortBy=publishedAt&pageSize=40&apiKey=${process.env.NEWSAPI_KEY}`;
    const data = await fetch(url).then(r => r.json()).catch(() => ({ articles: [] })) as { articles?: any[] };
    for(const a of data.articles||[]) articles.push({title:a.title,url:a.url,source:a.source?.name||'NewsAPI source',publishedAt:a.publishedAt,description:a.description,content:a.content,region:regionFor(`${a.title} ${a.description}`)});
  }
  const gdelt=`https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent('(NATO OR Ukraine OR Taiwan OR sanctions OR cyberattack OR conflict OR defense OR election OR China OR Russia OR "Middle East")')}&mode=ArtList&format=json&maxrecords=40&sort=HybridRel`;
  const gd = await fetch(gdelt).then(r => r.json()).catch(() => ({ articles: [] })) as { articles?: any[] };
  for(const a of gd.articles||[]) articles.push({title:a.title,url:a.url,source:a.sourceCountry||a.domain||'GDELT',publishedAt:a.seendate,description:a.title,region:regionFor(`${a.title} ${a.domain}`)});
  for(const feed of rssFeeds){ const xml=await fetch(feed).then(r=>r.text()).catch(()=> ''); const items=[...xml.matchAll(/<item>[\s\S]*?<title><!\[CDATA\[(.*?)\]\]><\/title>[\s\S]*?<link>(.*?)<\/link>[\s\S]*?<pubDate>(.*?)<\/pubDate>/g)].slice(0,8); for(const m of items) articles.push({title:m[1],url:m[2],source:new URL(feed).hostname,publishedAt:m[3],region:regionFor(m[1])}); }
  const seen=new Set<string>(); return articles.filter(a=>a.title&&a.url&&!seen.has(a.url)&&seen.add(a.url)).slice(0,60);
}
export function fallbackBrief(){ return { id:`brief-${new Date().toISOString().slice(0,10)}`, date:new Date().toISOString().slice(0,10), title:'Morning Intelligence Brief', executiveSummary:'Live AI generation requires OPENAI_API_KEY. This fallback confirms the pipeline collected public-source articles and will not fabricate uncited claims.', overallThreatScore:0, generatedAt:new Date().toISOString(), topDevelopments:[], regionUpdates:{Europe:[], 'Middle East':[], 'Indo-Pacific':[], Americas:[], Africa:[], Global:[]}, sources:[] }; }
export async function generateBrief(regionFilters?: string[]){
  const articles=await collectNews();
  if(!process.env.OPENAI_API_KEY) return {...fallbackBrief(), executiveSummary:`Collected ${articles.length} public-source items. Add OPENAI_API_KEY to generate cited analysis.`, sources:articles.slice(0,10).map(a=>({title:a.title,outlet:a.source,url:a.url,publishedAt:a.publishedAt}))};
  const openai=new OpenAI({apiKey:process.env.OPENAI_API_KEY});
  const filtered=regionFilters?.length ? articles.filter(a=>regionFilters.includes(a.region||'Global')) : articles;
  const prompt=`You are a public-source geopolitical intelligence analyst. Use ONLY the provided articles. Do not fabricate facts. Separate factual reporting from analysis. Avoid social media. Return strict JSON matching this TypeScript shape: {id,date,title,executiveSummary,overallThreatScore,generatedAt,topDevelopments:[{id,title,region,factualSummary,analysis,whyItMatters,whatToWatch:string[],citations:[{title,outlet,url,publishedAt}],threat:{score,label,explanation,factors:{militaryEscalation,economicImpact,diplomaticImportance,humanitarianImpact,usForeignPolicyRelevance}}}],regionUpdates:{Europe:string[],"Middle East":string[],"Indo-Pacific":string[],Americas:string[],Africa:string[],Global:string[]},sources:[{title,outlet,url,publishedAt}]}. Threat scores 1-5. Top 5 developments only. Articles: ${JSON.stringify(filtered.slice(0,45))}`;
  const completion=await openai.chat.completions.create({model:'gpt-4o-mini',temperature:0.2,response_format:{type:'json_object'},messages:[{role:'system',content:'Professional intelligence brief writer using public sources only.'},{role:'user',content:prompt}]});
  const brief=JSON.parse(completion.choices[0]?.message?.content || '{}');
  brief.id ||= `brief-${new Date().toISOString().slice(0,10)}`; brief.generatedAt ||= new Date().toISOString();
  const urls=new Set(filtered.map(a=>a.url));
  brief.topDevelopments=(brief.topDevelopments||[]).filter((d:any)=>Array.isArray(d.citations)&&d.citations.every((c:any)=>urls.has(c.url)));
  brief.sources=[...new Map(brief.topDevelopments.flatMap((d:any)=>d.citations).map((c:any)=>[c.url,c])).values()];
  const db=supabaseAdmin(); if(db) await db.from('briefs').upsert({id:brief.id, brief_date:brief.date, title:brief.title, executive_summary:brief.executiveSummary, overall_threat_score:brief.overallThreatScore, payload:brief});
  return brief;
}
export function renderPdfBuffer(brief:any): Promise<Buffer>{ return new Promise(resolve=>{ const doc=new PDFDocument({size:'LETTER',margin:42}); const chunks:Buffer[]=[]; doc.on('data',c=>chunks.push(c)); doc.on('end',()=>resolve(Buffer.concat(chunks))); doc.fontSize(10).fillColor('#627084').text(brief.date || new Date().toISOString().slice(0,10), {align:'right'}); doc.fillColor('#0b1b33').fontSize(22).text(brief.title||'Morning Intelligence Brief'); doc.moveDown(.4).fontSize(11).fillColor('#1f2a3a').text(`Overall threat score: ${brief.overallThreatScore ?? 'N/A'}/5`); doc.moveDown().fontSize(13).fillColor('#0b1b33').text('Executive Summary'); doc.fontSize(9.5).fillColor('#26364d').text(brief.executiveSummary||'No summary available.', {lineGap:2}); (brief.topDevelopments||[]).slice(0,5).forEach((d:any,i:number)=>{ doc.moveDown(.6).fontSize(12).fillColor('#0b1b33').text(`${i+1}. ${d.title}`); doc.fontSize(9).fillColor('#26364d').text(`Region: ${d.region} | Threat: ${d.threat?.score}/5 ${d.threat?.label||''}`); doc.text(`Factual reporting: ${d.factualSummary}`); doc.text(`Analysis: ${d.analysis}`); doc.text(`Why it matters: ${d.whyItMatters}`); doc.fillColor('#52627a').text(`Sources: ${(d.citations||[]).map((c:any)=>c.outlet).join('; ')}`); }); doc.moveDown().fontSize(11).fillColor('#0b1b33').text('Sources and Citations'); (brief.sources||[]).slice(0,12).forEach((s:any, i:number)=>doc.fontSize(8).fillColor('#26364d').text(`${i+1}. ${s.outlet || ''} — ${s.title}: ${s.url}`)); doc.end(); }); }
