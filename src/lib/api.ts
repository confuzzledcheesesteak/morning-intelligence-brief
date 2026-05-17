import type { Brief, SubscriptionSettings } from '../types';

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export async function generateBrief(): Promise<Brief> {
  return parseJson<Brief>(await fetch('/api/generate-brief', { method: 'POST' }));
}

export async function getArchive(): Promise<Brief[]> {
  return parseJson<Brief[]>(await fetch('/api/archive'));
}

export async function saveSubscription(settings: SubscriptionSettings): Promise<{ ok: true }> {
  return parseJson<{ ok: true }>(await fetch('/api/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings)
  }));
}

export function pdfUrl(briefId: string): string {
  return `/api/pdf?briefId=${encodeURIComponent(briefId)}`;
}
