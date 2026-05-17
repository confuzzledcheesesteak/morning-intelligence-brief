import type { Handler } from '@netlify/functions';
import { Resend } from 'resend';
import { createBrief, json, plainTextBrief, saveBrief, supabaseAdmin } from './shared';

export const handler: Handler = async () => {
  const brief = await createBrief();
  await saveBrief(brief);
  const supabase = supabaseAdmin();
  const resendKey = process.env.RESEND_API_KEY;
  if (!supabase || !resendKey) return json({ ok: true, briefId: brief.id, delivered: 0, warning: 'Supabase or Resend not configured.' });
  const { data: subscribers } = await supabase.from('subscriptions').select('*').eq('active', true);
  const resend = new Resend(resendKey);
  let delivered = 0;
  for (const subscriber of subscribers || []) {
    if (Number(subscriber.minimum_threat_level || 1) > brief.overallThreatScore) continue;
    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Morning Intelligence Brief <briefs@example.com>',
      to: subscriber.email,
      subject: `${brief.title} — ${brief.date} — Risk ${brief.overallThreatScore}/5`,
      text: plainTextBrief(brief)
    });
    delivered += 1;
  }
  return json({ ok: true, briefId: brief.id, delivered });
};
