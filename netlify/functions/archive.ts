import type { Handler } from '@netlify/functions';
import { json, supabaseAdmin } from './shared';

export const handler: Handler = async () => {
  const supabase = supabaseAdmin();
  if (!supabase) return json([]);
  const { data, error } = await supabase.from('briefs').select('payload').order('generated_at', { ascending: false }).limit(30);
  if (error) return json({ error: error.message }, 500);
  return json((data || []).map((row) => row.payload));
};
