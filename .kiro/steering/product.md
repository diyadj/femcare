---
inclusion: always
---

# FemCare — Product Context

## What FemCare Is

FemCare is an AI-assisted gynaecological health platform that maximises the clinical value of the annual gynaecological appointment. It supports patients and clinicians across three phases: before, during, and after the consultation.

The core problem: a 15-minute appointment must cover cervical screening, STI testing, contraception, breast health, and mental health. Patients arrive unprepared, there is no continuity between years, and up to 40% of follow-up actions are never completed.

## Three-Phase Product

| Phase | What it does |
|-------|-------------|
| Pre-visit | Structured intake form, AI triage, patient brief delivered to clinician before appointment |
| In-consultation | Dynamic checklist, lab trend analysis, decision support |
| Post-visit | Plain-language summary for patient, follow-up reminders, longitudinal timeline |

The MVP focuses on the pre-visit module only.

## Users

- **Patients** — complete intake forms, receive post-visit summaries. Mobile-first experience. Non-medical audience; plain language required.
- **Clinicians** — receive patient briefs before appointments, use in-consultation tools. Clinical language is appropriate.

## AI Safety Constraints (Non-Negotiable)

- All AI output is **advisory only** — no clinical decisions are ever automated
- Every AI-generated artefact must carry `is_advisory: true`
- When in doubt about urgency, always escalate — never downgrade
- Never speculate about conditions not evidenced in the intake data
- Patient-facing output must target Grade 8 reading level (Flesch-Kincaid)
- Clinician-facing briefs must be scannable in under 2 minutes

## Compliance Requirements

- **GDPR:** Explicit consent before any data collection; right to access and deletion; data minimisation
- **Data residency:** eu-west-1 (Ireland) by default
- **Audit trail:** Every patient data access and AI recommendation must be logged; 7-year retention
- **PII in logs:** Hashed IDs only — never names or raw health data in logs
- **SaMD pathway:** Architecture designed with CE marking in mind from day one

## Roadmap

- Phase 1 (0–12 months): Clinical pilots, 5–10 practices, pre-visit module only
- Phase 2 (12–24 months): Full 3-phase product, EHR integrations
- Phase 3 (24–40 months): Hospital networks, insurer partnerships
