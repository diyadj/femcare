---
inclusion: always
---

# FemCare — Tech Stack & Conventions

## Core Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.11+, FastAPI |
| AI Agents | Strands SDK (`strands-agents`) |
| LLM | Claude Sonnet 4.5 via Amazon Bedrock (`anthropic.claude-sonnet-4-5`, region `eu-west-1`) |
| Database | DynamoDB (patient records, audit log, reminders) |
| Object storage | S3 (briefs, summaries, lab documents) |
| Auth | AWS Cognito — patient self-signup pool, clinician invite-only pool (TOTP MFA required) |
| Infrastructure | AWS CDK (TypeScript) |
| Frontend | React (TypeScript), mobile-first PWA |
| EHR integration | HL7 FHIR R4 (Phase 2+) |
| Email / notifications | Amazon SES |
| Scheduling | EventBridge |

## Python Dependencies

Production (`requirements.txt`):
- `fastapi==0.115.0`, `uvicorn[standard]==0.30.0`
- `pydantic==2.7.0` — all models use Pydantic v2
- `boto3==1.34.0`
- `strands-agents==0.1.0`, `strands-agents-tools==0.1.0`
- `python-dotenv==1.0.0`

Dev (`requirements-dev.txt`):
- `pytest`, `pytest-asyncio`, `pytest-cov`
- `httpx` — async test client for FastAPI
- `moto[dynamodb,s3,ses]` — AWS service mocking in tests
- `ruff` — linting and formatting
- `mypy` — type checking

## Agent Patterns

All agents follow the same Strands pattern:

```python
from strands import Agent, tool
from strands.models import BedrockModel

MODEL = BedrockModel(
    model_id="anthropic.claude-sonnet-4-5",
    region_name="eu-west-1",
)

@tool
def my_tool(...) -> ...:
    """Docstring is the tool description shown to the model."""
    ...

agent = Agent(model=MODEL, system_prompt=SYSTEM_PROMPT, tools=[my_tool])
result = agent(prompt)
```

- Tools are plain Python functions decorated with `@tool`
- System prompts always include the advisory-only constraint
- Every agent call must be followed by an `AuditLogger.log()` call

## API Conventions

- Base path: `/api/v1/`
- Routers live in `src/api/routers/`, one file per domain
- All routes use Pydantic request/response models
- Consent must be verified before any data is persisted (see `intake.py` pattern)
- Return patient-facing messages in plain language; never expose internal errors

## Security Rules

- Never log raw PII — hash patient IDs and IP addresses before writing to any log
- All DynamoDB writes use `ConditionExpression="attribute_not_exists(event_id)"` for audit immutability
- `AuditLogger.log()` must never raise — audit failure must not block clinical flow
- IP addresses are SHA-256 hashed, truncated to 16 chars before storage
- TLS 1.3 minimum in transit; KMS AES-256 at rest

## Running Locally

```bash
# Backend
uvicorn src.api.main:app --reload

# Tests (single run)
pytest --cov=src tests/

# Lint
ruff check src/

# Type check
mypy src/
```
