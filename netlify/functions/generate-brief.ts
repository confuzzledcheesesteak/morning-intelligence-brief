import type { Handler } from '@netlify/functions';
import { createBrief, json, saveBrief } from './shared';

export const handler: Handler = async () => {
  try {
    const brief = await createBrief();
    await saveBrief(brief);
    return json(brief);
  } catch (error) {
    return json({ error: 'Brief generation failed', detail: (error as Error).message }, 500);
  }
};
