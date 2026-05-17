import type { Handler } from '@netlify/functions';
import { json, supabaseAdmin } from './_shared';
export const handler: Handler = async () => { const db=supabaseAdmin(); if(!db) return json(200,{briefs:[]}); const {data,error}=await db.from('briefs').select('id, brief_date, title, executive_summary, overall_threat_score, created_at').order('brief_date',{ascending:false}).limit(30); if(error) return json(500,{error:error.message}); return json(200,{briefs:data}); };
