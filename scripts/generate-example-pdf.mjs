import fs from 'node:fs';
import path from 'node:path';
import PDFDocument from 'pdfkit';

const outDir = path.resolve('examples');
fs.mkdirSync(outDir, { recursive: true });
const out = path.join(outDir, 'example-brief.pdf');
const doc = new PDFDocument({ size: 'LETTER', margin: 42 });
doc.pipe(fs.createWriteStream(out));
doc.fontSize(10).fillColor('#627084').text('2026-05-16', { align: 'right' });
doc.fillColor('#0b1b33').fontSize(22).text('Morning Intelligence Brief');
doc.moveDown(.4).fontSize(11).fillColor('#1f2a3a').text('Overall threat score: 3.6/5');
doc.moveDown().fontSize(13).fillColor('#0b1b33').text('Executive Summary');
doc.fontSize(9.5).fillColor('#26364d').text('Demo brief using example data. Production briefs are generated only from cited public sources retrieved at runtime; uncited claims are excluded by the citation checker.', { lineGap: 2 });
[
  ['NATO readiness and deterrence remain central to European security planning', 'Europe', '4/5', 'https://www.nato.int/cps/en/natohq/news.htm'],
  ['Taiwan Strait activity monitored for escalation indicators', 'Indo-Pacific', '4/5', 'https://www.mnd.gov.tw/english/'],
  ['Energy security remains a pressure point in sanctions and conflict policy', 'Global', '3/5', 'https://www.iea.org/news'],
  ['Cyber operations and election security require attribution caution', 'Global', '3/5', 'https://www.cisa.gov/news-events/cybersecurity-advisories'],
  ['Middle East diplomatic and conflict indicators tracked separately', 'Middle East', '4/5', 'https://news.un.org/en/news/region/middle-east']
].forEach(([title, region, score, source], i) => {
  doc.moveDown(.6).fontSize(12).fillColor('#0b1b33').text(`${i+1}. ${title}`);
  doc.fontSize(9).fillColor('#26364d').text(`Region: ${region} | Threat: ${score}`);
  doc.text('Factual reporting: Demo item. Production briefs must cite public reporting.');
  doc.text('Analysis: Analytical assessment is separated from reported facts and scored using the transparent model.');
  doc.fillColor('#52627a').text(`Source: ${source}`);
});
doc.end();
console.log(out);
