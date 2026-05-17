# Threat Scoring Model

Each development receives five 1–5 sub-scores:

1. Military escalation risk
2. Economic impact
3. Diplomatic importance
4. Humanitarian impact
5. Relevance to U.S. foreign policy

The current total is a transparent equal-weight average:

```text
total = mean(military + economic + diplomatic + humanitarian + us_policy)
```

Risk levels:

- 1.0–1.74: Low
- 1.75–2.74: Guarded
- 2.75–3.49: Elevated
- 3.50–4.24: High
- 4.25–5.0: Severe

The score is not a prediction. It is an explainable triage model for comparing public-source developments. Editors should review AI scoring before publication.
