# Morning Intelligence Brief Generator

A Netlify-ready React + TypeScript web app that creates a daily one-page geopolitical intelligence brief from public news sources, scores global threats transparently, renders a PDF, and emails subscribers every morning.

Built for students, journalists, and policy researchers. The app is designed to be portfolio-quality for college applications: polished UI, documented architecture, public-source discipline, citation checks, and deployment automation.

## Features

- Public-source news collection from NewsAPI, GDELT, and RSS fallbacks.
- Focus areas: international relations, defense, conflict, elections, sanctions, cyberattacks, energy security, NATO, Russia, China, Ukraine, Taiwan, Middle East, and U.S. foreign policy.
- AI summarization with OpenAI.
- Explicit separation between factual reporting and analysis.
- Transparent 1-5 threat scoring model.
- PDF generation with citations.
- Email scheduling through Resend.
- Supabase schema for briefs, subscribers, and collected articles.
- Netlify functions and scheduled function support.
- Dashboard with Today's Brief, archive placeholder, threat cards, interactive map, region filters, settings, dark mode, mobile responsiveness.

## Tech Stack

Frontend: React, TypeScript, Vite
Backend: Netlify serverless functions on Node.js
Database/Auth: Supabase-ready schema
AI: OpenAI API
News: NewsAPI, GDELT, RSS fallbacks
Email: Resend
PDF: PDFKit
Scheduling: Netlify Scheduled Functions

## Quick Start

```bash
npm install
cp .env.example .env
npm run dev
```

For Netlify local functions:

```bash
npm run netlify:dev
```

## Production Build

```bash
npm run build
```

## Environment Variables

Copy `.env.example` and configure secrets in Netlify, not in git. Key variables:

- `OPENAI_API_KEY`
- `NEWSAPI_KEY` (optional but recommended)
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `RESEND_FROM`
- `APP_BASE_URL`

See `docs/ENVIRONMENT.md`.

## Deployment

This repo includes `netlify.toml`:

- Build command: `npm run build`
- Publish directory: `dist`
- Functions directory: `netlify/functions`
- API redirect: `/api/*` -> `/.netlify/functions/:splat`

See `docs/DEPLOYMENT.md` and `docs/DEPLOYMENT_CHECKLIST.md`.

## Database

Run `supabase/schema.sql` in the Supabase SQL editor.

## Public-Source and Safety Rules

- Do not fabricate facts.
- Require citations for every claim group.
- Separate factual reporting from analytical judgment.
- Use public sources only.
- Avoid unverified social media unless explicitly labeled.
- No classified, hacked, leaked, private, or doxxed material.

## Agent Workflow

See `docs/AGENT_WORKFLOW.md` for the six-agent workflow:
News Collector, Relevance Filter, Threat Analyst, Brief Writer, Citation Checker, and PDF + Delivery Agent.

## Example Outputs

- `docs/EXAMPLE_BRIEF.md`
- `examples/example-brief.pdf` generated with `npm run generate:example-pdf`

## Scripts

- `npm run dev`: local Vite dev server.
- `npm run netlify:dev`: local Netlify functions + frontend.
- `npm run build`: typecheck and production build.
- `npm run deploy`: Netlify preview deploy.
- `npm run deploy:prod`: Netlify production deploy.
- `npm run generate:example-pdf`: create example PDF artifact.
