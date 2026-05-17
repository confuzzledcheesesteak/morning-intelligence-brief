import React, { useMemo, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { AlertTriangle, Archive, CalendarClock, Download, Globe2, Mail, Moon, Radar, RefreshCw, ShieldAlert, Sun, Zap } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { exampleBrief } from './data/exampleBrief';
import { generateBrief, getArchive, pdfUrl, saveSubscription } from './lib/api';
import type { Brief, Region, SubscriptionSettings } from './types';
import './styles.css';

const regions: Region[] = ['Global', 'Europe', 'Indo-Pacific', 'Middle East', 'Americas', 'Africa'];

function scoreClass(score: number) {
  if (score >= 4.25) return 'severe';
  if (score >= 3.5) return 'high';
  if (score >= 2.75) return 'elevated';
  return 'guarded';
}

function App() {
  const [brief, setBrief] = useState<Brief>(exampleBrief);
  const [archive, setArchive] = useState<Brief[]>([exampleBrief]);
  const [activeRegion, setActiveRegion] = useState<Region | 'All'>('All');
  const [dark, setDark] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('Demo brief loaded. Generate a live brief after API keys are configured.');
  const [settings, setSettings] = useState<SubscriptionSettings>({ email: '', deliveryTime: '07:00', regions, minimumThreatLevel: 2 });

  const visibleDevelopments = useMemo(() => {
    return activeRegion === 'All' ? brief.developments : brief.developments.filter((d) => d.region === activeRegion);
  }, [activeRegion, brief.developments]);

  const chartData = brief.developments.map((d) => ({ name: d.region.replace('Indo-Pacific', 'Indo'), score: d.score.total, headline: d.headline }));

  async function handleGenerate() {
    setBusy(true);
    setMessage('Collecting public news, scoring risk, writing brief, and checking citations…');
    try {
      const liveBrief = await generateBrief();
      setBrief(liveBrief);
      setArchive((items) => [liveBrief, ...items.filter((item) => item.id !== liveBrief.id)]);
      setMessage('Live brief generated with public-source citations.');
    } catch (error) {
      setMessage(`Live generation failed; showing demo data. ${(error as Error).message}`);
    } finally {
      setBusy(false);
    }
  }

  async function handleArchive() {
    try {
      const items = await getArchive();
      if (items.length) setArchive(items);
      setMessage(`Loaded ${items.length} archived brief(s).`);
    } catch (error) {
      setMessage(`Archive unavailable: ${(error as Error).message}`);
    }
  }

  async function handleSubscribe(event: React.FormEvent) {
    event.preventDefault();
    if (!settings.email) return;
    setBusy(true);
    try {
      await saveSubscription(settings);
      setMessage(`Subscription saved for ${settings.email} at ${settings.deliveryTime}.`);
    } catch (error) {
      setMessage(`Subscription failed: ${(error as Error).message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className={dark ? 'app dark' : 'app'}>
      <section className="hero">
        <div>
          <p className="eyebrow"><Radar size={16}/> Public-source geopolitical intelligence</p>
          <h1>Morning Intelligence Brief Generator</h1>
          <p className="subtitle">Daily one-page international relations and defense briefings with transparent scoring, citations, PDF export, and email delivery.</p>
          <div className="actions">
            <button className="primary" onClick={handleGenerate} disabled={busy}>{busy ? <RefreshCw className="spin"/> : <Zap/>} Generate Brief Now</button>
            <a className="secondary" href={pdfUrl(brief.id)} target="_blank" rel="noreferrer"><Download/> Export PDF</a>
            <button className="ghost" onClick={() => setDark((value) => !value)}>{dark ? <Sun/> : <Moon/>} {dark ? 'Light' : 'Dark'} mode</button>
          </div>
          <p className="status">{message}</p>
        </div>
        <div className={`threat-meter ${scoreClass(brief.overallThreatScore)}`}>
          <ShieldAlert size={34}/>
          <span>Threat Score</span>
          <strong>{brief.overallThreatScore.toFixed(1)}</strong>
          <small>1 low · 5 severe</small>
        </div>
      </section>

      <section className="grid top-grid">
        <article className="panel brief-panel">
          <div className="panel-title"><Globe2/> Today's Brief · {brief.date}</div>
          <h2>{brief.title}</h2>
          <p>{brief.executiveSummary}</p>
          <div className="risk-list">
            {brief.riskIndicators.map((item) => <span key={item}><AlertTriangle size={14}/>{item}</span>)}
          </div>
          <p className="analyst-note"><strong>Analyst note:</strong> {brief.analystNote}</p>
        </article>
        <article className="panel map-panel">
          <div className="panel-title"><Globe2/> Interactive map proxy</div>
          <div className="world-map" aria-label="Regional threat map">
            {regions.map((region, index) => (
              <button key={region} style={{ '--x': `${18 + (index % 3) * 30}%`, '--y': `${22 + Math.floor(index / 3) * 36}%` } as React.CSSProperties} onClick={() => setActiveRegion(region)}>
                {region}
              </button>
            ))}
          </div>
        </article>
      </section>

      <section className="panel">
        <div className="panel-title"><ShieldAlert/> Threat cards</div>
        <div className="filters">
          <button onClick={() => setActiveRegion('All')} className={activeRegion === 'All' ? 'active' : ''}>All</button>
          {regions.map((region) => <button key={region} onClick={() => setActiveRegion(region)} className={activeRegion === region ? 'active' : ''}>{region}</button>)}
        </div>
        <div className="cards">
          {visibleDevelopments.map((development, index) => (
            <article className={`card ${scoreClass(development.score.total)}`} key={development.id}>
              <div className="card-head"><span>#{index + 1} · {development.region}</span><strong>{development.score.total.toFixed(1)}</strong></div>
              <h3>{development.headline}</h3>
              <p>{development.summary}</p>
              <details>
                <summary>Score explanation</summary>
                <p>{development.score.explanation}</p>
                <ul>
                  <li>Military escalation: {development.score.militaryEscalation}/5</li>
                  <li>Economic impact: {development.score.economicImpact}/5</li>
                  <li>Diplomatic importance: {development.score.diplomaticImportance}/5</li>
                  <li>Humanitarian impact: {development.score.humanitarianImpact}/5</li>
                  <li>U.S. policy relevance: {development.score.usPolicyRelevance}/5</li>
                </ul>
              </details>
              <p><strong>Why it matters:</strong> {development.whyItMatters}</p>
              <p><strong>Watch next:</strong> {development.whatToWatch}</p>
              <div className="citations">{development.citations.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.publisher}</a>)}</div>
            </article>
          ))}
        </div>
      </section>

      <section className="grid">
        <article className="panel">
          <div className="panel-title"><Radar/> Threat ranking chart</div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,.25)" />
              <XAxis dataKey="name" stroke="currentColor" />
              <YAxis domain={[0, 5]} stroke="currentColor" />
              <Tooltip contentStyle={{ background: '#101827', border: '1px solid #334155', borderRadius: 12 }} />
              <Bar dataKey="score" fill="#38bdf8" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </article>
        <article className="panel">
          <div className="panel-title"><Globe2/> Region-by-region updates</div>
          <div className="region-list">
            {Object.entries(brief.regionalUpdates).map(([region, updates]) => <div key={region}><strong>{region}</strong><ul>{updates.map((update) => <li key={update}>{update}</li>)}</ul></div>)}
          </div>
        </article>
      </section>

      <section className="grid">
        <form className="panel settings" onSubmit={handleSubscribe}>
          <div className="panel-title"><Mail/> Email automation</div>
          <label>Email address<input value={settings.email} type="email" placeholder="you@example.com" onChange={(event) => setSettings({ ...settings, email: event.target.value })}/></label>
          <label>Delivery time<input value={settings.deliveryTime} type="time" onChange={(event) => setSettings({ ...settings, deliveryTime: event.target.value })}/></label>
          <label>Minimum threat score<input value={settings.minimumThreatLevel} min={1} max={5} step={0.5} type="range" onChange={(event) => setSettings({ ...settings, minimumThreatLevel: Number(event.target.value) })}/><span>{settings.minimumThreatLevel}</span></label>
          <button className="primary" disabled={busy || !settings.email}>Save schedule</button>
        </form>
        <article className="panel archive">
          <div className="panel-title"><Archive/> Archive <button onClick={handleArchive}>Refresh</button></div>
          {archive.map((item) => <button key={item.id} onClick={() => setBrief(item)}><CalendarClock size={16}/><span>{item.date}</span><strong>{item.overallThreatScore.toFixed(1)}</strong></button>)}
        </article>
      </section>

      <footer>
        <p>Designed for students, journalists, and policy researchers. Uses public sources only; separates sourced reporting from analytical judgments.</p>
      </footer>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
