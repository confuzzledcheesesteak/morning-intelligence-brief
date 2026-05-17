# Deployment Guide: GitHub → Netlify

## 1. Create required services

- Supabase project
- OpenAI API key
- Optional NewsAPI key (GDELT + RSS work without it)
- Resend account and verified sending domain
- Netlify account
- GitHub repository

## 2. Supabase

1. Open Supabase SQL editor.
2. Run `supabase/schema.sql`.
3. Copy:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

Never expose the service role key in frontend code.

## 3. Netlify environment variables

Netlify dashboard → Site configuration → Environment variables:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `OPENAI_MODEL` (example: `gpt-4o-mini`)
- `NEWSAPI_KEY` (optional)
- `RESEND_API_KEY`
- `EMAIL_FROM`
- `APP_BASE_URL`

## 4. Netlify build settings

Already configured in `netlify.toml`:

- Build command: `npm run build`
- Publish directory: `dist`
- Functions directory: `netlify/functions`
- API redirects: `/api/* → /.netlify/functions/:splat`
- Scheduled function: `daily-brief` at `0 12 * * *` UTC

## 5. GitHub continuous deployment

1. Push the repo to GitHub.
2. Netlify → Add new site → Import an existing project.
3. Select GitHub and this repository.
4. Keep detected settings from `netlify.toml`.
5. Add environment variables.
6. Deploy.

Every push to `main` triggers a Netlify production build.

## 6. Netlify CLI deployment

```bash
npm install
npx netlify login
npx netlify init
npx netlify deploy --build
npx netlify deploy --build --prod
```

If using a token in CI:

```bash
NETLIFY_AUTH_TOKEN=... npx netlify deploy --build --prod
```

## 7. Custom domain

1. Netlify → Domain management → Add a domain.
2. Enter your domain.
3. Update DNS at your registrar:
   - Apex: Netlify load balancer records shown in dashboard, or ALIAS/ANAME if supported
   - Subdomain: CNAME to your Netlify app domain
4. Enable HTTPS in Netlify after DNS propagates.
5. Set `APP_BASE_URL=https://yourdomain.com`.

## 8. Remaining manual steps

Automatic deployment requires a Netlify login or `NETLIFY_AUTH_TOKEN`. Without that, the code can be pushed to GitHub but Netlify site creation must be completed in the dashboard.
