# Environment Variable Guide

## Frontend-safe variables

These are embedded in the Vite client bundle and must be public-safe:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Server-only secrets

These must exist only in Netlify environment variables or local `.env` files:

- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `NEWSAPI_KEY`
- `RESEND_API_KEY`

## Local setup

```bash
cp .env.example .env
npm install
npx netlify dev
```

`netlify dev` loads functions and frontend together at `http://localhost:8888`.

## Secret hygiene

- Do not commit `.env`.
- Rotate any key pasted into chat or committed by accident.
- Prefer Netlify UI/CLI env management over hardcoding.
