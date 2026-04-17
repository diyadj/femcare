# FemCare — Tech Steering

## Core Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| AI Agents | Strands SDK (AWS) | All agent logic lives here |
| LLM | Claude Sonnet via Amazon Bedrock | Default model for all AI features |
| Backend | Python 3.11 / FastAPI | REST API + async where needed |
| Database | DynamoDB | Patient records, sessions, audit logs |
| Document store | S3 | Patient briefs, lab results, summaries |
| Infrastructure | AWS CDK (TypeScript) | All infra as code |
| Frontend | React 18 + TypeScript | Mobile-first, Tailwind CSS |
| Auth | AWS Cognito | Separate user pools for patients and clinicians |
| EHR | HL7 FHIR R4 | Standard for healthcare interoperability |
| CI/CD | GitHub Actions | Test → lint → deploy |

## Strands SDK Usage

- Use Strands for ALL AI agent functionality — do not call Bedrock directly from application code
- Each phase (pre-visit, in-consultation, post-visit) has its own agent
- Agents are stateless — all context is passed in, never stored in the agent
- Tool use must be explicit and logged

### Agent structure
```
src/agent/
├── intake_agent.py          # Pre-visit intake triage
├── brief_generator.py       # Patient brief generation
├── consultation_agent.py    # In-consultation support
├── summary_agent.py         # Post-visit summary
└── tools/
    ├── triage_tools.py      # Red-flag detection
    ├── fhir_tools.py        # EHR read/write
    └── reminder_tools.py    # Follow-up scheduling
```

## AWS Services

- **Bedrock** — LLM inference (Claude Sonnet)
- **DynamoDB** — patient data, audit trail
- **S3** — documents, briefs, lab results
- **Cognito** — authentication (two user pools: patient, clinician)
- **API Gateway** — REST API exposure
- **Lambda** — async processing (brief generation, reminders)
- **SES** — email notifications and reminders
- **CloudWatch** — logging and monitoring
- **KMS** — encryption key management

## Data Models

All patient data uses Pydantic models. Key models:

- `PatientProfile` — demographics, history, preferences
- `IntakeForm` — pre-visit symptom and history submission
- `PatientBrief` — AI-generated clinician summary
- `ConsultationSession` — in-visit interaction record
- `VisitSummary` — post-visit patient-facing summary
- `AuditEvent` — immutable log of all data access

## Security & Compliance

- All data encrypted at rest with AWS KMS (AES-256)
- All data encrypted in transit (TLS 1.3 minimum)
- No patient PII in logs — use patient IDs only
- EU data residency by default (eu-west-1)
- GDPR: explicit consent required before any data collection
- Audit log is append-only — never delete audit events
- All AI outputs must include a `confidence_level` and `is_advisory: true` flag

## Coding Standards

- Python: follow PEP 8, use type hints everywhere, docstrings on all public functions
- TypeScript: strict mode, no `any` types
- All API endpoints must have OpenAPI documentation
- Every function that touches patient data must log an audit event
- No hardcoded credentials — use AWS Secrets Manager
- No patient data in environment variables

## Testing

- Unit tests for all business logic (pytest)
- Integration tests for all API endpoints
- Mock Bedrock responses in tests — never call real LLM in CI
- Minimum 80% code coverage
- Keep tests simple — one assertion per test where possible

## What NOT to do

- Do not call Bedrock directly — always go through Strands agents
- Do not store patient data in application logs
- Do not use percentage-based widths in DynamoDB queries (use GSIs)
- Do not add complexity before the pre-visit module is proven
- Do not generate overly complex test suites — keep them maintainable
