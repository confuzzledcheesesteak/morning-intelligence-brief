import type { Config, Handler } from '@netlify/functions';
import { Resend } from 'resend';
import { generateBrief, json, renderPdfBuffer, supabaseAdmin } from './_shared';
export const config: Config = { schedule: '0 11 * * *' };
export const handler: Handler = async () => { try { const brief=await generateBrief(); const db=supabaseAdmin(); const {data:subs=[]}= db ? await db.from('subscribers').select('*').eq('is_active', true) : {data:[] as any[]}; if(!process.env.RESEND_API_KEY) return json(202,{message:'Brief generated. Add RESEND_API_KEY to email subscribers.', briefId:brief.id, subscribers:subs?.length||0}); const pdf=await renderPdfBuffer(brief); const resend=new Resend(process.env.RESEND_API_KEY); for(const sub of subs||[]) await resend.emails.send({from:process.env.RESEND_FROM||'Morning Brief <onboarding@resend.dev>',to:sub.email,subject:`${brief.title} — ${brief.date}`,text:`${brief.executiveSummary}

Threat score: ${brief.overallThreatScore}/5

Open dashboard: ${process.env.APP_BASE_URL||''}`,attachments:[{filename:`${brief.id}.pdf`,content:pdf.toString('base64')}]}); return json(200,{message:'Daily brief sent', briefId:brief.id, subscribers:subs?.length||0}); } catch(error){ return json(500,{error:(error as Error).message}); } };
