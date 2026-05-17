import type { Handler } from '@netlify/functions';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { createBrief, supabaseAdmin, type Brief } from './shared';

function lines(text: string, max = 92) {
  const words = text.split(/\s+/); const out: string[] = []; let line = '';
  for (const word of words) { if ((line + ' ' + word).trim().length > max) { out.push(line.trim()); line = word; } else line = `${line} ${word}`; }
  if (line.trim()) out.push(line.trim()); return out;
}

export const handler: Handler = async (event) => {
  let brief: Brief | null = null;
  const briefId = event.queryStringParameters?.briefId;
  const supabase = supabaseAdmin();
  if (briefId && supabase) {
    const { data } = await supabase.from('briefs').select('payload').eq('id', briefId).maybeSingle();
    brief = data?.payload as Brief | null;
  }
  if (!brief) brief = await createBrief();

  const doc = await PDFDocument.create();
  const page = doc.addPage([612, 792]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  let y = 752;
  page.drawText('MORNING INTELLIGENCE BRIEF', { x: 42, y, size: 18, font: bold, color: rgb(0.08,0.16,0.28) });
  page.drawText(`${brief.date}  |  Threat Score ${brief.overallThreatScore}/5`, { x: 42, y: y-20, size: 10, font, color: rgb(0.35,0.42,0.52) }); y -= 52;
  page.drawText('Executive Summary', { x: 42, y, size: 12, font: bold }); y -= 16;
  for (const line of lines(brief.executiveSummary, 104)) { page.drawText(line, { x: 42, y, size: 9, font }); y -= 12; }
  y -= 10; page.drawText('Top 5 Global Developments', { x: 42, y, size: 12, font: bold }); y -= 18;
  brief.developments.slice(0,5).forEach((d, i) => {
    if (y < 110) return;
    page.drawText(`${i+1}. ${d.headline}`.slice(0, 98), { x: 42, y, size: 10, font: bold, color: rgb(0.02,0.22,0.38) }); y -= 13;
    page.drawText(`${d.region} | Risk ${d.score.total}/5 | ${d.score.level}`, { x: 54, y, size: 8.5, font, color: rgb(0.72,0.25,0.08) }); y -= 12;
    for (const line of lines(`Why it matters: ${d.whyItMatters}`, 96).slice(0,3)) { page.drawText(line, { x: 54, y, size: 8.5, font }); y -= 11; }
    const sourceLine = `Sources: ${d.citations.map(c => c.publisher).join(', ')}`;
    page.drawText(sourceLine.slice(0, 105), { x: 54, y, size: 8, font, color: rgb(0.12,0.45,0.75) }); y -= 16;
  });
  page.drawText('Risk indicators: ' + brief.riskIndicators.join(' · ').slice(0, 110), { x: 42, y: 54, size: 8, font, color: rgb(0.35,0.42,0.52) });
  page.drawText('Public sources only. Analysis is separated from cited factual reporting.', { x: 42, y: 38, size: 8, font, color: rgb(0.35,0.42,0.52) });
  const bytes = await doc.save();
  return { statusCode: 200, headers: { 'content-type': 'application/pdf', 'content-disposition': `inline; filename="${brief.id}.pdf"` }, body: Buffer.from(bytes).toString('base64'), isBase64Encoded: true };
};
