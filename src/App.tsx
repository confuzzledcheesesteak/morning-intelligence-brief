import { useMemo, useState } from 'react';
import { AlertTriangle, CalendarClock, Download, Globe2, Mail, Moon, Radio, RefreshCw, Shield, Sun } from 'lucide-react';
import { sampleBrief } from './sampleBrief';
import type { Brief, Region, SubscriberSettings } from './types';

const regions: Region[] = ['Global', 'Europe', 'Middle East', 'Indo-Pacific', 'Americas', 'Africa'];
const regionPositions: Record<Region, { x: number; y: number }> = { Global:{x:50,y:50}, Europe:{x:50,y:31}, 'Middle East':{x:58,y:43}, 'Indo-Pacific':{x:75,y:50}, Americas:{x:23,y:46}, Africa:{x:52,y:58} };

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<T>;
}

function scoreClass(score: number) { return score >= 4 ? 'high' : score >= 3 ? 'moderate' : 'guarded'; }

export default function App() {
  const [brief, setBrief] = useState<Brief>(sampleBrief);
  const [selectedRegion, setSelectedRegion] = useState<Region | 'All'>('All');
  const [settings, setSettings] = useState<SubscriberSettings>({ email:'', deliveryTime:'07:00', regionFilters: regions, darkMode:true });
  const [status, setStatus] = useState('Demo brief loaded. Add API keys in Netlify to generate live briefs.');
  const [isGenerating, setIsGenerating] = useState(false);

  const visibleDevelopments = useMemo(() => selectedRegion === 'All' ? brief.topDevelopments : brief.topDevelopments.filter(d => d.region === selectedRegion), [brief, selectedRegion]);

  async function generateBriefNow() {
    setIsGenerating(true); setStatus('Collecting public news, filtering by relevance, scoring threats, and checking citations...');
    try { const live = await postJson<Brief>('/api/generate-brief', { regionFilters: settings.regionFilters }); setBrief(live); setStatus('Live brief generated with citation checks.'); }
    catch (error) { setStatus(`Live generation unavailable: ${(error as Error).message}. Showing demo brief.`); }
    finally { setIsGenerating(false); }
  }

  async function subscribe() {
    if (!settings.email) { setStatus('Enter an email address first.'); return; }
    try { await postJson('/api/subscribe', settings); setStatus(`Delivery scheduled for ${settings.email} at ${settings.deliveryTime}.`); }
    catch (error) { setStatus(`Subscription could not be saved: ${(error as Error).message}`); }
  }

  function downloadPdf() { window.open(`/api/generate-brief?format=pdf&id=${encodeURIComponent(brief.id)}`, '_blank'); }

  return <main className={settings.darkMode ? 'app dark' : 'app light'}>
    <section className="hero">
      <div><p className="eyebrow"><Radio size={16}/> Public-source geopolitical intelligence</p><h1>Morning Intelligence Brief Generator</h1><p className="lede">A portfolio-quality dashboard that turns reliable public news into a cited, one-page analytical brief for students, journalists, and policy researchers.</p><div className="hero-actions"><button onClick={generateBriefNow} disabled={isGenerating}><RefreshCw className={isGenerating?'spin':''}/> Generate Brief Now</button><button className="secondary" onClick={downloadPdf}><Download/> PDF Brief</button><button className="ghost" onClick={()=>setSettings(s=>({...s,darkMode:!s.darkMode}))}>{settings.darkMode ? <Sun/> : <Moon/>} {settings.darkMode?'Light':'Dark'} mode</button></div></div>
      <div className={`threat-meter ${scoreClass(brief.overallThreatScore)}`}><Shield size={32}/><span>Threat score</span><strong>{brief.overallThreatScore.toFixed(1)}/5</strong><small>Weighted model: military escalation, economic impact, diplomacy, humanitarian impact, U.S. policy relevance.</small></div>
    </section>

    <section className="status-bar"><AlertTriangle size={18}/><span>{status}</span></section>

    <section className="grid two">
      <article className="panel"><div className="panel-head"><h2>Today's Brief</h2><span>{brief.date}</span></div><h3>{brief.title}</h3><p>{brief.executiveSummary}</p><div className="split-note"><strong>Factual reporting</strong><span>Claims must link to public sources.</span><strong>Analysis</strong><span>Judgments are labeled and scored separately.</span></div></article>
      <article className="panel"><div className="panel-head"><h2>Interactive Map</h2><Globe2/></div><div className="map"><svg viewBox="0 0 100 60" role="img" aria-label="regional risk map"><path d="M2 22 C12 10 24 13 31 20 C40 5 55 8 62 20 C73 13 91 18 98 31 C89 45 73 46 66 39 C58 55 39 54 32 42 C18 50 7 42 2 22Z"/><path d="M46 18 l10 4 l-4 9 l-12 0 l-2-8z"/><path d="M56 34 l9 4 l-3 8 l-10-1z"/><path d="M70 28 l19 5 l-8 12 l-18-4z"/><path d="M14 28 l16 3 l-6 13 l-14-5z"/>{regions.map(r=>{const p=regionPositions[r]; const dev=brief.topDevelopments.find(d=>d.region===r); return <g key={r} onClick={()=>setSelectedRegion(r)} className="map-pin"><circle cx={p.x} cy={p.y} r={dev ? dev.threat.score + 1 : 3}/><text x={p.x+3} y={p.y-2}>{r}</text></g>})}</svg></div><div className="filters"><button className={selectedRegion==='All'?'active':''} onClick={()=>setSelectedRegion('All')}>All</button>{regions.map(r=><button key={r} className={selectedRegion===r?'active':''} onClick={()=>setSelectedRegion(r)}>{r}</button>)}</div></article>
    </section>

    <section className="panel"><div className="panel-head"><h2>Top 5 Global Developments</h2><span>{visibleDevelopments.length} visible</span></div><div className="cards">{visibleDevelopments.map((dev, i)=><article className="card" key={dev.id}><div className="rank">#{i+1}</div><div><h3>{dev.title}</h3><p className="tag">{dev.region} · <span className={scoreClass(dev.threat.score)}>{dev.threat.label} {dev.threat.score}/5</span></p><p><strong>Factual summary:</strong> {dev.factualSummary}</p><p><strong>Analysis:</strong> {dev.analysis}</p><p><strong>Why it matters:</strong> {dev.whyItMatters}</p><details><summary>Threat score explanation</summary><div className="score-grid">{Object.entries(dev.threat.factors).map(([k,v])=><span key={k}>{k.replace(/[A-Z]/g, m=>' '+m).trim()}: <b>{v}/5</b></span>)}</div><p>{dev.threat.explanation}</p></details><div className="sources">{dev.citations.map(c=><a href={c.url} target="_blank" rel="noreferrer" key={c.url}>{c.outlet}: {c.title}</a>)}</div></div></article>)}</div></section>

    <section className="grid two"><article className="panel"><div className="panel-head"><h2>Region-by-Region Updates</h2></div>{Object.entries(brief.regionUpdates).map(([region, updates])=><div className="region" key={region}><h3>{region}</h3><ul>{updates.map(u=><li key={u}>{u}</li>)}</ul></div>)}</article><article className="panel"><div className="panel-head"><h2>User Settings + Delivery</h2><CalendarClock/></div><label>Email address<input value={settings.email} onChange={e=>setSettings({...settings,email:e.target.value})} placeholder="you@example.com"/></label><label>Delivery time<input type="time" value={settings.deliveryTime} onChange={e=>setSettings({...settings,deliveryTime:e.target.value})}/></label><label>Region filters<select multiple value={settings.regionFilters} onChange={e=>setSettings({...settings,regionFilters:Array.from(e.target.selectedOptions).map(o=>o.value as Region)})}>{regions.map(r=><option key={r}>{r}</option>)}</select></label><button onClick={subscribe}><Mail/> Save Morning Email Schedule</button><div className="archive"><h3>Archive</h3><button>Today · {brief.date}</button><button disabled>Prior briefs appear after Supabase is connected</button></div></article></section>
  </main>;
}
