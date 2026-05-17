# Environment Variable Guide

Never commit real secrets. Store them in Netlify environment variables and local `.env` only.

- `VITE_SUPABASE_URL`: browser-safe Supabase project URL.
- `VITE_SUPABASE_ANON_KEY`: browser-safe anon key if adding client auth.
- `SUPABASE_URL`: server function Supabase URL.
- `SUPABASE_SERVICE_ROLE_KEY`: private key used only by Netlify functions.
- `OPENAI_API_KEY`: private OpenAI key for generation.
- `NEWSAPI_KEY`: optional NewsAPI key for more current coverage.
- `RESEND_API_KEY`: private key for email delivery.
- `RESEND_FROM`: verified sender, e.g. `Morning Brief <briefs@example.com>`.
- `APP_BASE_URL`: deployed Netlify URL used in emails.
- `BRIEF_TIMEZONE`: default timezone label.
- `DEFAULT_DELIVERY_TIME`: default user delivery time.
