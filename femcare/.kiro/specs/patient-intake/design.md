# Design: Patient Pre-Visit Intake Form

## Architecture

```
Patient (Mobile Browser)
        │
        ▼
React Frontend (intake form UI)
        │  POST /api/v1/intake/submit
        ▼
FastAPI — IntakeRouter
        │
        ├──▶ AuditLogger (log submission event)
        │
        ├──▶ IntakeService
        │         │
        │         ├──▶ DynamoDB (save encrypted intake)
        │         │
        │         └──▶ Strands IntakeAgent
        │                    │
        │                    ├──▶ TriageTools (red-flag detection)
        │                    │
        │                    └──▶ BriefGeneratorAgent
        │                               │
        │                               ├──▶ S3 (store brief PDF)
        │                               │
        │                               └──▶ ClinicianNotifier
        │                                          │
        │                                          └──▶ SES / Push notification
        │
        └──▶ Response to patient (confirmation + red-flag message if applicable)
```

## Data Flow

1. Patient submits form → encrypted payload sent to API
2. API saves raw intake to DynamoDB with `status: pending`
3. IntakeAgent runs triage synchronously (< 5s target)
4. If red-flag detected: clinician notified immediately, patient shown urgent message
5. BriefGeneratorAgent generates brief asynchronously (Lambda)
6. Brief stored in S3, metadata in DynamoDB, clinician notified
7. Intake record updated to `status: brief_ready`

## Key Data Models

### IntakeForm
```python
class IntakeForm(BaseModel):
    patient_id: str
    appointment_id: str
    submitted_at: datetime
    symptoms: list[Symptom]
    reproductive_history: ReproductiveHistory
    family_history: FamilyHistory
    lifestyle: LifestyleFactors
    medications: list[Medication]
    patient_questions: str
    consent_given_at: datetime
    data_version: str = "1.0"
```

### PatientBrief
```python
class PatientBrief(BaseModel):
    brief_id: str
    patient_id: str
    appointment_id: str
    generated_at: datetime
    concern_summary: str           # max 3 sentences
    history_flags: list[str]
    red_flags: list[RedFlag]       # empty list if none
    suggested_screening: list[str]
    patient_questions: str
    is_advisory: bool = True       # always True
    confidence_level: float        # 0.0 - 1.0
    model_version: str
```

### RedFlag
```python
class RedFlag(BaseModel):
    category: str
    description: str
    urgency: Literal["urgent", "high", "medium"]
    escalated_at: datetime
    escalation_channel: str
```

## Strands Agent Design

### IntakeAgent
- **Purpose:** Triage intake, detect red flags
- **Tools:** `detect_red_flags`, `assess_risk_profile`, `log_triage_event`
- **Input:** IntakeForm
- **Output:** TriageResult (red_flags, risk_profile, screening_recommendations)
- **Max tokens:** 1000
- **Must not:** make diagnostic statements, use clinical jargon in patient-facing output

### BriefGeneratorAgent
- **Purpose:** Generate the clinician-facing patient brief
- **Tools:** `get_patient_history`, `format_brief`, `store_brief`
- **Input:** IntakeForm + TriageResult + PatientHistory
- **Output:** PatientBrief
- **Max tokens:** 1500
- **Tone:** Clinical, concise, structured — written for a clinician

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/intake/start` | Create new intake session |
| PUT | `/api/v1/intake/{id}/save` | Save progress |
| POST | `/api/v1/intake/{id}/submit` | Submit completed form |
| GET | `/api/v1/intake/{id}/status` | Check brief generation status |
| GET | `/api/v1/brief/{id}` | Retrieve brief (clinician only) |

## Frontend Components

```
IntakePage
├── ConsentScreen          (shown once, first visit)
├── IntakeProgressBar
├── SectionNavigator
│   ├── SymptomsSection
│   ├── ReproductiveHistorySection
│   ├── FamilyHistorySection
│   ├── LifestyleSection
│   ├── MedicationsSection
│   └── QuestionsSection
├── ReviewScreen           (before submission)
└── ConfirmationScreen     (post-submission)
```

## Security Considerations

- Intake payload encrypted client-side before transmission (field-level encryption for PII)
- DynamoDB items encrypted at rest via KMS
- S3 briefs encrypted, access restricted to clinician Cognito pool
- All API calls require valid Cognito JWT
- Audit event logged on every read and write of patient data
- Red-flag detection runs server-side — never expose triage logic to client
