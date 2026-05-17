# Morning Intelligence Brief Generator

Portfolio-quality React + TypeScript + Netlify application that generates a daily one-page geopolitical intelligence brief from public news sources.

## What it does

- Collects global news from GDELT, RSS feeds, and optional NewsAPI.
- Filters for international relations, defense, conflict, elections, sanctions, cyberattacks, energy security, NATO, Russia, China, Ukraine, Taiwan, Middle East developments, and U.S. foreign policy.
- Generates a one-page intelligence-style brief with:
  - Executive Summary
  - Top 5 Global Developments
  - Threat Ranking
  - Region-by-Region Updates
  - Why It Matters
  - What To Watch Next
  - Sources and Citations
- Scores each development using a transparent 1–5 model.
- Generates a clean PDF with date, title, threat score, risk indicators, and citations.
- Supports email subscriptions and scheduled daily delivery.
- Includes a polished responsive dashboard with dark mode, archive, threat cards, region filters, map proxy, and settings.

## Ethics and sourcing rules

- Public sources only.
- No classified, hacked, leaked, private, or stolen data.
- No fabricated facts.
- Citations are required for every selected development.
- Analysis is labeled separately from factual reporting.
- Unverified social media is excluded unless a future source adapter clearly labels it as unverified.

## Architecture

```text
React/Vite dashboard
  ↓ /api/* redirects
Netlify Functions
  ├─ generate-brief: news collection + scoring + OpenAI synthesis
  ├─ archive: reads prior briefs from Supabase
  ├─ pdf: creates PDF from a saved or live brief
  ├─ subscribe: saves email delivery settings
  └─ daily-brief: scheduled generation + Resend email delivery
Supabase
  ├─ briefs
  └─ subscriptions
```

Autonomous agent workflow is implemented as function stages:

1. News Collector Agent — `collectNews()` gathers GDELT/RSS/NewsAPI articles.
2. Relevance Filter Agent — keyword/topic scoring filters IR and defense relevance.
3. Threat Analyst Agent — scoring model assigns risk dimensions and explanations.
4. Brief Writer Agent — OpenAI writes concise cited summaries when configured.
5. Citation Checker Agent — generated items must cite URLs from the collected source set.
6. PDF + Delivery Agent — `pdf` and `daily-brief` functions format and email the report.

## Local development

```bash
npm install
cp .env.example .env
npx netlify dev
```

Open:

```text
http://localhost:8888
```

For frontend only:

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Netlify deployment

This repo is Netlify-ready:

- `netlify.toml` included
- build command: `npm run build`
- publish directory: `dist`
- serverless functions directory: `netlify/functions`
- scheduled daily function configured
- `.env.example` included

See `docs/DEPLOYMENT.md` for full GitHub → Netlify setup.

## Required environment variables

See `docs/ENVIRONMENT.md`.

Minimum useful production setup:

```bash
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
OPENAI_API_KEY=...
RESEND_API_KEY=...
EMAIL_FROM="Morning Intelligence Brief <briefs@yourdomain.com>"
```

NewsAPI is optional because GDELT and RSS feeds are public fallbacks.

## Database schema

Run `supabase/schema.sql` in the Supabase SQL editor.

## PDF

PDFs are served by:

```text
/api/pdf?briefId=<brief-id>
```

If no saved brief is found, the function generates a live PDF from current public-source collection.

## Notes for college portfolio reviewers

This project demonstrates:

- Full-stack TypeScript/React product design
- Serverless backend architecture
- Public-source data ingestion
- Responsible AI summarization with citations
- Explainable risk scoring
- PDF generation
- Email automation
- Database-backed archive and settings
- Netlify deployment readiness
