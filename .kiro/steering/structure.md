---
inclusion: always
---

# FemCare — Project Structure

## Directory Layout

```
femcare/
├── src/
│   ├── agent/                  # Strands AI agents
│   │   ├── intake_agent.py     # Triage agent — red flag detection, risk profiling
│   │   ├── brief_generator.py  # Clinician brief generation (async, Lambda)
│   │   ├── summary_agent.py    # Patient-facing post-visit summary
│   │   └── tools/              # Shared Strands @tool functions
│   ├── api/
│   │   ├── main.py             # FastAPI app, middleware, router registration
│   │   └── routers/
│   │       └── intake.py       # /api/v1/intake endpoints
│   ├── models/
│   │   └── intake.py           # All Pydantic models (IntakeForm, PatientBrief, AuditEvent, etc.)
│   └── utils/
│       └── audit_logger.py     # AuditLogger — must be called on every patient data event
├── tests/
│   ├── unit/                   # Unit tests, mocked AWS (moto)
│   └── integration/            # Integration tests
├── infrastructure/
│   ├── bin/                    # CDK app entry point
│   └── lib/
│       └── femcare-stack.ts    # CDK stack definition
├── docs/
│   └── architecture.md         # System architecture and data flow diagrams
├── .kiro/
│   ├── steering/               # Kiro steering documents (product.md, tech.md, structure.md)
│   ├── hooks/                  # Kiro agent hooks
│   └── specs/                  # Feature specs
├── requirements.txt
├── requirements-dev.txt
└── README.md
```

## Key Modules

### `src/models/intake.py`
Single source of truth for all data models. Add new models here. Key types:
- `IntakeForm` — the patient's pre-visit submission
- `TriageResult` — output of IntakeAgent (red flags, risk profile, screening suggestions)
- `PatientBrief` — clinician-facing artefact; always `is_advisory=True`
- `RedFlag` — categorised urgent finding with urgency level
- `AuditEvent` — immutable audit record; action field is a closed enum

### `src/agent/`
One file per agent. Each agent owns its Strands `@tool` functions locally unless they are shared (put shared tools in `tools/`). Every agent module must:
1. Define a `MODEL` using `BedrockModel` pointing to `eu-west-1`
2. Include the advisory-only constraint in `SYSTEM_PROMPT`
3. Call `AuditLogger.log()` after every agent invocation

### `src/api/routers/`
One router file per domain (e.g. `intake.py`, future: `brief.py`, `visit.py`). Register routers in `main.py` with a versioned prefix (`/api/v1/...`). Always verify consent before persisting any patient data.

### `src/utils/audit_logger.py`
`AuditLogger` is a singleton-style class instantiated at module level (`audit = AuditLogger()`). It must never raise — errors are swallowed and sent to CloudWatch. The `action` field must be one of the values in the `AuditEvent.action` enum.

### `infrastructure/lib/femcare-stack.ts`
AWS CDK stack. All infrastructure changes go here. DynamoDB tables, S3 buckets, Lambda functions, Cognito pools, and EventBridge rules are all defined in CDK.

## Naming Conventions

- Python files: `snake_case`
- Pydantic models: `PascalCase`
- API route files: domain name only (e.g. `intake.py`, not `intake_router.py`)
- DynamoDB table names: `femcare-{env}-{resource}` (e.g. `femcare-dev-audit`)
- S3 keys: `{resource_type}/{patient_id}/{appointment_id}/{id}.json`

## Adding a New Feature

1. Add Pydantic models to `src/models/` (or a new model file if the domain is large)
2. Add a new router in `src/api/routers/` and register it in `main.py`
3. If AI is involved, add a new agent file in `src/agent/` following the existing pattern
4. Add unit tests in `tests/unit/` using `moto` for AWS mocking
5. Update the CDK stack if new AWS resources are needed
