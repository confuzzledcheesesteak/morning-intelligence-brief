import type { Handler } from '@netlify/functions';
import { json, supabaseAdmin } from './_shared';
import { z } from 'zod';
const schema = z.object({ email: z.string().email(), deliveryTime: z.string().regex(/^\d{2}:\d{2}$/), regionFilters: z.array(z.string()).default(['Global']), darkMode: z.boolean().optional() });
export const handler: Handler = async (event) => { try { if(event.httpMethod !== 'POST') return json(405,{error:'Method not allowed'}); const input=schema.parse(JSON.parse(event.body||'{}')); const db=supabaseAdmin(); if(!db) return json(202,{message:'Settings validated. Configure Supabase env vars to persist subscriptions.', input}); const {error}=await db.from('subscribers').upsert({email:input.email, delivery_time:input.deliveryTime, region_filters:input.regionFilters, is_active:true}); if(error) throw error; return json(200,{message:'Subscription saved'}); } catch(error){ return json(400,{error:(error as Error).message}); } };
