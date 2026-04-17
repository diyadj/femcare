# Tasks: Patient Pre-Visit Intake Form

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Complete

---

## Phase 1 — Foundation

- [ ] **TASK-001** Set up DynamoDB tables: `femcare-dev-patients`, `femcare-dev-intakes`, `femcare-dev-briefs`, `femcare-dev-audit` *(required)*
- [ ] **TASK-002** Set up S3 buckets: `femcare-dev-briefs` with KMS encryption and lifecycle policies *(required)*
- [ ] **TASK-003** Configure Cognito user pools: `femcare-patients` and `femcare-clinicians` with appropriate password policies *(required)*
- [ ] **TASK-004** Create Pydantic models: `IntakeForm`, `PatientBrief`, `RedFlag`, `TriageResult`, `AuditEvent` *(required)*
- [ ] **TASK-005** Implement `AuditLogger` utility — append-only audit events to DynamoDB *(required)*
- [ ] **TASK-006** Implement encryption utilities using AWS KMS *(required)*

## Phase 2 — Backend API

- [ ] **TASK-007** Create FastAPI app skeleton with CORS, auth middleware, and OpenAPI docs *(required)*
- [ ] **TASK-008** Implement `POST /api/v1/intake/start` — create intake session, record consent *(required)*
- [ ] **TASK-009** Implement `PUT /api/v1/intake/{id}/save` — save partial form progress *(required)*
- [ ] **TASK-010** Implement `POST /api/v1/intake/{id}/submit` — submit completed form *(required)*
- [ ] **TASK-011** Implement `GET /api/v1/intake/{id}/status` — poll brief generation status *(required)*
- [ ] **TASK-012** Implement `GET /api/v1/brief/{id}` — retrieve brief (clinician auth required) *(required)*

## Phase 3 — Strands Agents

- [ ] **TASK-013** Implement `TriageTools` — red-flag detection rules for the 5 core categories *(required)*
- [ ] **TASK-014** Implement `IntakeAgent` using Strands SDK — triage intake, return TriageResult *(required)*
- [ ] **TASK-015** Implement `BriefGeneratorAgent` using Strands SDK — generate PatientBrief from IntakeForm + TriageResult *(required)*
- [ ] **TASK-016** Wire agent invocation into intake submission flow *(required)*
- [ ] **TASK-017** Implement clinician notification via SES for brief delivery and red-flag alerts *(required)*

## Phase 4 — Frontend

- [ ] **TASK-018** Scaffold React app with TypeScript, Tailwind, React Router *(required)*
- [ ] **TASK-019** Implement `ConsentScreen` component with GDPR-compliant consent capture *(required)*
- [ ] **TASK-020** Implement `SymptomsSection` component *(required)*
- [ ] **TASK-021** Implement `ReproductiveHistorySection` component *(required)*
- [ ] **TASK-022** Implement `FamilyHistorySection` component *(required)*
- [ ] **TASK-023** Implement `LifestyleSection` component *(required)*
- [ ] **TASK-024** Implement `MedicationsSection` component *(required)*
- [ ] **TASK-025** Implement `QuestionsSection` component *(required)*
- [ ] **TASK-026** Implement `ReviewScreen` and `ConfirmationScreen` *(required)*
- [ ] **TASK-027** Implement progress saving and session restoration *(required)*
- [ ] **TASK-028** Mobile responsiveness pass — test on 375px viewport *(required)*

## Phase 5 — Testing

- [ ] **TASK-029** Unit tests for all Pydantic models *(required)*
- [ ] **TASK-030** Unit tests for `AuditLogger` and encryption utilities *(required)*
- [ ] **TASK-031** Unit tests for triage tools with mock red-flag scenarios *(required)*
- [ ] **TASK-032** Unit tests for Strands agents with mocked Bedrock responses *(required)*
- [ ] **TASK-033** Integration tests for all API endpoints *(required)*
- [ ] **TASK-034** Test: confirm no PII appears in CloudWatch logs *(required)*

## Phase 6 — Infrastructure

- [ ] **TASK-035** CDK stack for DynamoDB, S3, Cognito *(required)*
- [ ] **TASK-036** CDK stack for API Gateway + Lambda *(required)*
- [ ] **TASK-037** GitHub Actions CI pipeline: lint → test → deploy to staging *(optional)*
