# FemCare

**AI-assisted gynaecological health platform — from pre-visit preparation to post-visit continuity.**

FemCare maximises the clinical value of the annual gynaecological appointment by supporting patients and clinicians before, during, and after the consultation.

---

## The Problem

A 15-minute appointment must cover cervical screening, STI testing, contraception, breast health, and mental health. Something always gets missed.

- GPs average 12 minutes per consultation
- Patients arrive unprepared — no structured symptom history
- No continuity between years — each visit starts from scratch
- Up to 40% of follow-up actions are never completed

## The Solution

Three-phase AI platform built on AWS using the Strands SDK:

| Phase | What it does |
|-------|-------------|
| **Pre-visit** | Structured intake, AI triage, patient brief sent to clinician |
| **In-consultation** | Dynamic checklist, lab trend analysis, decision support |
| **Post-visit** | Plain-language summary, follow-up reminders, longitudinal timeline |

---

## Architecture Overview

```
Patient (Mobile/Web)
        │
        ▼
┌──────────────────┐
│   API Gateway    │
└────────┬─────────┘
         │
┌────────▼─────────┐     ┌─────────────────────┐
│  FastAPI Backend │────▶│  Strands AI Agents  │
└────────┬─────────┘     └─────────────────────┘
         │                        │
┌────────▼─────────┐     ┌────────▼────────────┐
│   DynamoDB       │     │  Amazon Bedrock      │
│   (patient data) │     │  (Claude Sonnet)     │
└──────────────────┘     └─────────────────────┘
         │
┌────────▼─────────┐
│   S3             │
│   (documents,    │
│    briefs, labs) │
└──────────────────┘
```

---

## Tech Stack

- **AI Agents:** Strands SDK (AWS)
- **LLM:** Claude Sonnet via Amazon Bedrock
- **Backend:** Python / FastAPI
- **Database:** DynamoDB (patient records), S3 (documents)
- **Infrastructure:** AWS CDK
- **Frontend:** React (TypeScript), mobile-first
- **Auth:** AWS Cognito
- **EHR Integration:** HL7 FHIR R4

---

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- AWS CLI configured
- AWS CDK installed

### Installation

```bash
git clone https://github.com/your-org/femcare.git
cd femcare

# Backend
cd src
pip install -r requirements.txt

# Frontend
cd frontend
npm install

# Infrastructure
cd infrastructure
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

### Run locally

```bash
# Backend API
uvicorn src.api.main:app --reload

# Frontend
cd src/frontend && npm run dev
```

---

## Project Structure

```
femcare/
├── .kiro/
│   ├── steering/          # Kiro steering documents
│   │   ├── product.md
│   │   ├── structure.md
│   │   └── tech.md
│   ├── hooks/             # Kiro agent hooks
│   │   ├── test-gen.kiro.hook
│   │   └── privacy-check.kiro.hook
│   └── specs/             # Feature specs
│       └── patient-intake/
│           ├── requirements.md
│           ├── design.md
│           └── tasks.md
├── src/
│   ├── agent/             # Strands AI agents
│   ├── api/               # FastAPI routes and handlers
│   ├── models/            # Data models (Pydantic)
│   ├── utils/             # Shared utilities
│   └── frontend/          # React frontend
├── infrastructure/        # AWS CDK stacks
├── tests/
│   ├── unit/
│   └── integration/
└── docs/                  # Architecture and API docs
```

---

## Compliance & Safety

- **GDPR:** All patient data encrypted at rest (AES-256) and in transit (TLS 1.3)
- **AI safety:** All AI output is advisory only — no clinical decisions are automated
- **Auditability:** Full audit trail on all patient data access and AI recommendations
- **SaMD pathway:** Architecture designed with CE marking in mind from day one
- **Data residency:** Configurable per deployment (EU by default)

---

## Roadmap

| Phase | Timeline | Target |
|-------|----------|--------|
| Phase 1 — Clinical Pilots | 0–12 months | 5–10 practices, pre-visit module only, €150K ARR |
| Phase 2 — Network Expansion | 12–24 months | Full 3-phase product, EHR integrations, €1.8M ARR |
| Phase 3 — Institutional Scale | 24–40 months | Hospital networks, insurer partnerships, €7M ARR |

---

## Contributing

This is currently a private repository. See `docs/contributing.md` for guidelines.

---

## License

Proprietary. All rights reserved.
