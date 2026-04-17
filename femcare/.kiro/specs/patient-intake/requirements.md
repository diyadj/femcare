# Feature Spec: Patient Pre-Visit Intake Form

## Overview

Allow a patient to complete a structured pre-visit intake form before their gynaecological appointment. The form collects symptoms, history, and lifestyle data. An AI agent triages the responses, detects red-flag symptoms, and generates a patient brief delivered to the clinician before the appointment.

---

## Requirements

### REQ-001 — Intake Form Sections
**WHEN** a patient starts the pre-visit intake  
**THE SYSTEM SHALL** present the following sections in order:
1. Current symptoms (free text + structured selectors)
2. Reproductive history (pregnancies, contraception, menstrual cycle)
3. Family history (relevant conditions: ovarian cancer, breast cancer, endometriosis, PCOS)
4. Lifestyle factors (smoking, alcohol, exercise, stress level)
5. Medications and supplements
6. Questions or concerns for the clinician (free text)

### REQ-002 — Cycle Data Integration
**WHEN** the patient has connected a cycle tracking app  
**THE SYSTEM SHALL** pre-populate relevant cycle data with explicit patient confirmation before submission

### REQ-003 — Progress Saving
**WHEN** a patient partially completes the form  
**THE SYSTEM SHALL** save progress automatically so they can resume later without losing data

### REQ-004 — Red-Flag Triage
**WHEN** the intake agent detects any of the following  
**THE SYSTEM SHALL** flag the response for urgent escalation before the appointment:
- Unexplained bleeding between periods or post-menopause
- Severe pelvic pain
- Symptoms consistent with ectopic pregnancy
- Signs of domestic abuse (via validated screening questions)
- Suicidal ideation or severe mental health distress

### REQ-005 — Red-Flag Escalation
**WHEN** a red-flag is detected  
**THE SYSTEM SHALL** immediately notify the clinician via their preferred channel (app notification / email) and display a clear message to the patient advising them to seek urgent care if needed

### REQ-006 — Patient Brief Generation
**WHEN** the patient submits the completed intake form  
**THE SYSTEM SHALL** generate a structured patient brief containing:
- Summary of current concerns (max 3 sentences)
- Key history flags relevant to this visit
- Red-flag alerts (if any)
- Suggested screening items based on age and risk profile
- Patient's own questions for the clinician

### REQ-007 — Brief Delivery
**WHEN** the patient brief is generated  
**THE SYSTEM SHALL** deliver it to the assigned clinician at least 2 hours before the appointment, or immediately if the appointment is within 2 hours

### REQ-008 — Plain Language
**WHEN** displaying any content to the patient  
**THE SYSTEM SHALL** use plain, non-clinical language (target: Flesch-Kincaid Grade 8 or below)

### REQ-009 — GDPR Consent
**WHEN** a patient starts the intake for the first time  
**THE SYSTEM SHALL** present a clear, plain-language consent screen explaining:
- What data is collected and why
- Who can see it (their clinician only)
- How to withdraw consent and delete data
- That data is never sold or used for advertising  
**AND** require explicit confirmation before proceeding

### REQ-010 — Data Retention
**WHEN** a patient requests data deletion  
**THE SYSTEM SHALL** delete all personal data within 30 days, except audit logs which are retained for 7 years per healthcare regulations

### REQ-011 — Accessibility
**WHEN** rendering the intake form  
**THE SYSTEM SHALL** meet WCAG 2.1 AA standards

### REQ-012 — Mobile First
**WHEN** the form is rendered on a mobile device  
**THE SYSTEM SHALL** be fully functional on screens 375px wide and above, with no horizontal scrolling

---

## Acceptance Criteria

- [ ] A patient can complete all sections of the intake form on mobile in under 10 minutes
- [ ] Red-flag symptoms trigger clinician notification within 60 seconds
- [ ] Patient brief is generated and delivered within 5 minutes of form submission
- [ ] All form data is encrypted before writing to DynamoDB
- [ ] No patient PII appears in application logs
- [ ] Consent is recorded with timestamp and stored in the audit log
- [ ] Form progress is restored correctly after session interruption
- [ ] All AI output in the brief is labelled `is_advisory: true`

---

## Out of Scope (for this spec)

- EHR write-back of intake data (Phase 2)
- Wearable data integration (Phase 2)
- Multi-language support (Phase 2)
- Clinician ability to edit the brief (Phase 2)
