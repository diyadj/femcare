# FemCare — Structure Steering

## Repository Layout

```
femcare/
├── .kiro/
│   ├── steering/                  # These files — always keep up to date
│   ├── hooks/                     # Automated agent hooks
│   └── specs/                     # Feature specs, one folder per feature
│       └── {feature-name}/
│           ├── requirements.md
│           ├── design.md
│           └── tasks.md
│
├── src/
│   ├── agent/                     # All Strands AI agent code
│   │   ├── intake_agent.py
│   │   ├── brief_generator.py
│   │   ├── consultation_agent.py
│   │   ├── summary_agent.py
│   │   └── tools/
│   │
│   ├── api/                       # FastAPI application
│   │   ├── main.py                # App entry point
│   │   ├── routers/
│   │   │   ├── patient.py
│   │   │   ├── clinician.py
│   │   │   ├── intake.py
│   │   │   ├── brief.py
│   │   │   └── visit.py
│   │   └── middleware/
│   │       ├── auth.py
│   │       └── audit.py
│   │
│   ├── models/                    # Pydantic data models
│   │   ├── patient.py
│   │   ├── intake.py
│   │   ├── brief.py
│   │   ├── visit.py
│   │   └── audit.py
│   │
│   ├── utils/
│   │   ├── encryption.py
│   │   ├── fhir.py
│   │   └── audit_logger.py
│   │
│   └── frontend/                  # React TypeScript app
│       ├── src/
│       │   ├── pages/
│       │   │   ├── patient/
│       │   │   └── clinician/
│       │   ├── components/
│       │   └── hooks/
│       └── package.json
│
├── infrastructure/                # AWS CDK
│   ├── lib/
│   │   ├── database-stack.ts
│   │   ├── api-stack.ts
│   │   ├── auth-stack.ts
│   │   └── frontend-stack.ts
│   └── bin/
│       └── femcare.ts
│
├── tests/
│   ├── unit/                      # Mirror src/ structure
│   └── integration/
│
├── docs/
│   ├── architecture.md
│   ├── api.md
│   └── contributing.md
│
├── .env.example
├── requirements.txt
├── requirements-dev.txt
└── README.md
```

## Naming Conventions

- **Files:** snake_case for Python, kebab-case for frontend
- **Classes:** PascalCase
- **Functions/variables:** snake_case (Python), camelCase (TypeScript)
- **API routes:** `/api/v1/{resource}/{action}` — always versioned
- **DynamoDB tables:** `femcare-{environment}-{entity}` e.g. `femcare-prod-patients`
- **S3 buckets:** `femcare-{environment}-{purpose}` e.g. `femcare-prod-briefs`
- **Lambdas:** `femcare-{environment}-{function}` e.g. `femcare-prod-brief-generator`

## Feature Spec Naming

Each feature gets its own folder under `.kiro/specs/`:
- `patient-intake` — pre-visit intake form
- `brief-generator` — AI patient brief
- `consultation-support` — in-consultation checklist and support
- `visit-summary` — post-visit summary
- `scheduling` — smart appointment system
- `longitudinal-timeline` — health history view

## Environment Naming

- `dev` — local development
- `staging` — pre-production testing
- `prod` — production

## Key Principles

- One file per responsibility — no god files
- All patient-touching code goes through `audit_logger.py`
- All AI logic goes through Strands agents — no direct Bedrock calls in routers
- Frontend components are dumb — business logic stays in the API
