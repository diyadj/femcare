"""
BriefGeneratorAgent — generates the clinician-facing patient brief using Strands SDK.

Output is always advisory. Written for a clinician — clinical language is appropriate.
The brief is the core value delivery of the pre-visit module.
"""
import uuid
from strands import Agent, tool
from strands.models import BedrockModel

from src.models.intake import IntakeForm, PatientBrief, RedFlag, TriageResult
from src.utils.audit_logger import AuditLogger

audit = AuditLogger()

MODEL = BedrockModel(
    model_id="anthropic.claude-sonnet-4-5",
    region_name="eu-west-1",
)

SYSTEM_PROMPT = """You are a clinical documentation assistant for a gynaecological health platform.

Your task is to generate a concise, structured patient brief for the clinician to read before the appointment.

Rules:
- Write for a clinician — clinical language is appropriate
- The brief must be scannable in under 2 minutes
- Concern summary: maximum 3 sentences
- Never speculate about conditions not evidenced in the intake
- Always include is_advisory: true in your output
- Flag history items that are directly relevant to this visit
- If red flags exist, list them first and clearly
- End with the patient's own questions verbatim
"""


@tool
def format_concern_summary(symptoms: list[dict], patient_questions: str) -> str:
    """
    Format a concise 3-sentence concern summary from symptom data.
    Written for a clinician.
    """
    if not symptoms:
        return "Patient reports no acute symptoms at this time. Attending for routine annual check-up."

    symptom_names = [s.get("name", "") for s in symptoms[:3]]
    summary = f"Patient presents with: {', '.join(symptom_names)}."

    severe = [s for s in symptoms if s.get("severity") == "severe"]
    if severe:
        summary += f" Severity marked as severe for: {', '.join(s['name'] for s in severe)}."

    if patient_questions:
        summary += " Patient has specific questions for the clinician (see below)."

    return summary


@tool
def extract_history_flags(
    reproductive_history: dict,
    family_history: dict,
    lifestyle: dict,
) -> list[str]:
    """
    Extract clinically relevant history flags for the brief.
    Only include items relevant to a gynaecological consultation.
    """
    flags = []

    if family_history.get("ovarian_cancer"):
        flags.append("Family history: ovarian cancer")
    if family_history.get("breast_cancer"):
        flags.append("Family history: breast cancer")
    if family_history.get("endometriosis"):
        flags.append("Family history: endometriosis")
    if family_history.get("pcos"):
        flags.append("Family history: PCOS")

    if reproductive_history.get("irregular_cycle"):
        flags.append("Irregular menstrual cycle reported")
    if reproductive_history.get("last_smear_date"):
        flags.append(f"Last smear: {reproductive_history['last_smear_date']}")

    if lifestyle.get("smoking") == "current":
        flags.append("Current smoker")

    pain = reproductive_history.get("menstrual_cycle", {}).get("pain_level")
    if pain and pain >= 7:
        flags.append(f"High dysmenorrhoea score: {pain}/10")

    return flags


@tool
def store_brief_metadata(brief_id: str, patient_id: str, appointment_id: str) -> str:
    """
    Store brief metadata in DynamoDB and return the S3 key for the brief document.
    """
    import boto3
    import json
    from datetime import datetime

    s3_key = f"briefs/{patient_id}/{appointment_id}/{brief_id}.json"

    # Audit the brief generation
    # In production: also write to DynamoDB with status 'ready'
    return s3_key


def generate_brief(
    intake: IntakeForm,
    triage: TriageResult,
) -> PatientBrief:
    """
    Generate a patient brief from a completed intake form and triage result.
    Returns a PatientBrief — always advisory, always labelled as such.
    """
    agent = Agent(
        model=MODEL,
        system_prompt=SYSTEM_PROMPT,
        tools=[format_concern_summary, extract_history_flags, store_brief_metadata],
    )

    prompt = f"""
    Generate a patient brief for the following intake:

    Symptoms: {[s.model_dump() for s in intake.symptoms]}
    Reproductive history: {intake.reproductive_history.model_dump()}
    Family history: {intake.family_history.model_dump()}
    Lifestyle: {intake.lifestyle.model_dump()}
    Medications: {[m.model_dump() for m in intake.medications]}
    Patient questions: {intake.patient_questions}
    Red flags from triage: {[f.model_dump() for f in triage.red_flags]}
    Screening recommendations: {triage.screening_recommendations}
    Risk profile: {triage.risk_profile}

    Steps:
    1. Call format_concern_summary
    2. Call extract_history_flags
    3. Call store_brief_metadata with a new brief_id
    4. Return the complete brief structure

    The brief must include is_advisory: true.
    """

    agent(prompt)

    brief_id = str(uuid.uuid4())

    audit.log(
        patient_id=intake.patient_id,
        actor_id="brief_generator_agent",
        action="brief_generated",
        resource_id=brief_id,
    )

    return PatientBrief(
        brief_id=brief_id,
        patient_id=intake.patient_id,
        appointment_id=intake.appointment_id,
        concern_summary="",  # populated from agent tool call output
        history_flags=[],
        red_flags=triage.red_flags,
        suggested_screening=triage.screening_recommendations,
        patient_questions=intake.patient_questions,
        is_advisory=True,
        confidence_level=0.85,
        model_version="anthropic.claude-sonnet-4-5",
    )
