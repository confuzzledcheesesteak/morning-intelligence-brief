# Hermes Autonomous Agent Workflow

The Netlify function pipeline is organized as six auditable agents. In production these can be separate scheduled jobs or subagents; in this implementation they run as deterministic stages in `netlify/functions/_shared.ts`.

1. News Collector Agent
   - Pulls NewsAPI when configured, GDELT by default, and RSS fallbacks from NATO, UN News, and CISA.
   - Deduplicates URLs and preserves source metadata.

2. Relevance Filter Agent
   - Keeps articles matching international relations, defense, conflict, elections, sanctions, cyberattacks, energy security, NATO, Russia, China, Ukraine, Taiwan, Middle East, and U.S. foreign policy.
   - Avoids unverified social media by using public APIs/RSS and reputable outlets.

3. Threat Analyst Agent
   - Scores each development from 1-5 using military escalation risk, economic impact, diplomatic importance, humanitarian impact, and U.S. foreign-policy relevance.
   - Requires an explanation for every score.

4. Brief Writer Agent
   - Produces Executive Summary, Top 5 Global Developments, Region Updates, Why It Matters, What To Watch Next, and Sources/Citations.
   - Separates factual reporting from analytical judgment.

5. Citation Checker Agent
   - Rejects any top development whose citations are not present in the collected public-source article set.
   - Keeps URLs attached to every claim group.

6. PDF + Delivery Agent
   - Renders the one-page PDF with PDFKit.
   - Sends daily email via Resend from the scheduled Netlify function.
