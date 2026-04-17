# FemCare — Architecture

## Overview

FemCare is a three-phase AI health platform built on AWS. All AI logic runs through the Strands SDK, which orchestrates agents backed by Claude Sonnet on Amazon Bedrock.

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                          │
│                                                          │
│   Patient (React PWA)      Clinician (React Web)        │
│   Mobile-first             Desktop / tablet             │
└───────────────┬─────────────────────────┬───────────────┘
                │                         │
                ▼                         ▼
┌─────────────────────────────────────────────────────────┐
│                   AUTH LAYER (Cognito)                   │
│                                                          │
│   Patient User Pool        Clinician User Pool          │
│   (self sign-up)           (invite-only, MFA required)  │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                  API LAYER (FastAPI)                     │
│                                                          │
│   /api/v1/intake     /api/v1/brief     /api/v1/visit    │
│                                                          │
│   Middleware: JWT auth, audit logging, rate limiting     │
└──────┬────────────────────────┬────────────────────────-┘
       │                        │
       ▼                        ▼
┌──────────────┐    ┌───────────────────────────────────┐
│  DynamoDB    │    │        AGENT LAYER (Strands)       │
│              │    │                                    │
│  patients    │    │  IntakeAgent                       │
│  intakes     │◀───│  → TriageTools (red-flag detect)  │
│  briefs      │    │                                    │
│  audit       │    │  BriefGeneratorAgent               │
│  reminders   │    │  → format_concern_summary          │
└──────────────┘    │  → extract_history_flags           │
                    │                                    │
┌──────────────┐    │  SummaryAgent                      │
│  S3          │◀───│  → simplify_clinical_text          │
│              │    │  → schedule_reminders              │
│  briefs/     │    └───────────────┬───────────────────-┘
│  summaries/  │                    │
│  labs/       │                    ▼
└──────────────┘    ┌───────────────────────────────────┐
                    │      Amazon Bedrock                │
                    │      Claude Sonnet 4.5             │
                    │      Region: eu-west-1             │
                    └───────────────────────────────────┘
```

## Data Flow — Pre-Visit (MVP)

```
1. Patient opens intake link (from appointment reminder email)
2. Consent screen → consent recorded in audit log
3. Patient completes 6-section intake form (auto-saves every 30s)
4. Patient submits → encrypted payload sent to API
5. API saves intake to DynamoDB (encrypted at rest via KMS)
6. IntakeAgent runs synchronous triage (< 5s)
   └── If red flag detected → clinician notified immediately via SES
7. BriefGeneratorAgent runs async (Lambda, target < 3 min)
8. Brief stored in S3, metadata in DynamoDB
9. Clinician notified: "Patient brief ready for [appointment]"
10. Clinician opens brief in their dashboard before appointment
```

## Security Architecture

| Concern | Implementation |
|---------|---------------|
| Data at rest | KMS AES-256, customer-managed key |
| Data in transit | TLS 1.3 minimum |
| Authentication | Cognito JWT, short-lived tokens |
| Clinician MFA | TOTP required (no SMS) |
| PII in logs | Hashed IDs only — never names or health data |
| Audit trail | Append-only DynamoDB, 7-year retention |
| AI safety | All outputs flagged `is_advisory: true` |
| Data residency | eu-west-1 (Ireland) by default |

## GDPR Compliance

| Requirement | Implementation |
|-------------|---------------|
| Consent | Explicit consent before any data collection, timestamped in audit log |
| Right to access | `GET /api/v1/patient/{id}/export` — returns all data as JSON |
| Right to deletion | `DELETE /api/v1/patient/{id}` — deletes within 30 days (except audit log) |
| Data minimisation | Only collect what is needed for the clinical interaction |
| Privacy notice | Shown in plain language before consent is requested |
| Data processor | AWS EU region, DPA in place |

## Future Integrations (Phase 2+)

- **EHR (Epic / HL7 FHIR R4):** Write patient brief and visit summary back to the patient's EHR record
- **Cycle tracking apps:** Read cycle data with patient consent (Apple Health, Clue, Natural Cycles)
- **Wearables:** Passive monitoring between visits (heart rate, sleep, activity)
- **Lab systems:** Direct ingestion of lab results for trend analysis
- **Insurer APIs:** Anonymised population analytics for preventive care reimbursement
