# Netlify Deployment Guide

## Automatic GitHub -> Netlify setup

1. Push this repository to GitHub.
2. In Netlify, choose Add new site -> Import an existing project.
3. Select the GitHub repository.
4. Netlify should auto-detect `netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions`
5. Add environment variables in Netlify -> Site configuration -> Environment variables.
6. Trigger Deploy site.

## Netlify CLI deployment

```bash
npm install
npm run build
netlify login
netlify init
netlify deploy --build
netlify deploy --build --prod
```

## Required environment variables

See `.env.example`. Minimum live generation requires:

- `OPENAI_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Recommended production additions:

- `NEWSAPI_KEY`
- `RESEND_API_KEY`
- `RESEND_FROM`
- `APP_BASE_URL`

## Custom domain

1. Netlify -> Domain management -> Add a domain.
2. Enter your domain, e.g. `briefs.yourdomain.com`.
3. Follow Netlify DNS instructions or add the provided CNAME record at your registrar.
4. Enable HTTPS after DNS propagates.

## Scheduling

`netlify/functions/send-daily-brief.ts` is configured with Netlify Scheduled Functions:

```ts
export const config = { schedule: '0 11 * * *' };
```

This runs at 11:00 UTC. Adjust to match the default morning delivery time for your audience.
