import type { Handler } from '@netlify/functions';
import { generateBrief, json, renderPdfBuffer } from './_shared';

export const handler: Handler = async (event) => {
  try {
    if (event.httpMethod === 'OPTIONS') return { statusCode: 204 };
    const wantsPdf = event.queryStringParameters?.format === 'pdf';
    const body = event.body ? JSON.parse(event.body) : {};
    const brief = await generateBrief(body.regionFilters);
    if (wantsPdf) { const pdf = await renderPdfBuffer(brief); return { statusCode: 200, headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `inline; filename="${brief.id}.pdf"` }, body: pdf.toString('base64'), isBase64Encoded: true }; }
    return json(200, brief);
  } catch (error) { return json(500, { error: (error as Error).message }); }
};
