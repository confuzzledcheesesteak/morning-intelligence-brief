import type { Handler } from '@netlify/functions';
import { z } from 'zod';
import { json, supabaseAdmin } from './shared';

const schema = z.object({ email: z.string().email(), deliveryTime: z.string().regex(/^\d{2}:\d{2}$/), regions: z.array(z.string()).default([]), minimumThreatLevel: z.number().min(1).max(5).default(1) });

export const handler: Handler = async (event) => {
  try {
    const payload = schema.parse(JSON.parse(event.body || '{}'));
    const supabase = supabaseAdmin();
    if (!supabase) return json({ ok: true, warning: 'Supabase not configured; subscription accepted in demo mode only.' });
    const { error } = await supabase.from('subscriptions').upsert({ email: payload.email, delivery_time: payload.deliveryTime, regions: payload.regions, minimum_threat_level: payload.minimumThreatLevel, active: true }, { onConflict: 'email' });
    if (error) return json({ error: error.message }, 500);
    return json({ ok: true });
  } catch (error) {
    return json({ error: (error as Error).message }, 400);
  }
};
