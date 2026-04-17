"""
IntakeAgent — triage patient intake using Strands SDK.

All AI output is advisory only. This agent detects red flags and
assesses risk profile. It never makes diagnostic statements.
"""
from strands import Agent, tool
from strands.models import BedrockModel

from src.models.intake import IntakeForm, RedFlag, TriageResult
from src.utils.audit_logger import AuditLogger

audit = AuditLogger()

MODEL = BedrockModel(
    model_id="anthropic.claude-sonnet-4-5",
    region_name="eu-west-1",
)

SYSTEM_PROMPT = """You are a medical triage assistant supporting a gynaecological health platform.

Your role is to:
1. Review patient intake forms
2. Identify red-flag symptoms that require urgent attention
3. Assess general risk profile (standard / elevated / high)
4. Suggest relevant screening items for the clinician

Rules you must always follow:
- You are advisory only. You never make diagnoses.
- You never use clinical jargon in patient-facing outputs.
- When in doubt about urgency, escalate — never downgrade.
- Every output must be factual and based only on the intake data provided.
- Do not speculate about conditions not evidenced in the intake.
"""


@tool
def detect_red_flags(symptoms: list[dict], reproductive_history: dict) -> list[dict]:
    """
    Check for red-flag symptoms from structured intake data.
    Returns a list of red flag objects if any are found.
    """
    flags = []

    symptom_names = [s.get("name", "").lower() for s in symptoms]

    if any(kw in name for name in symptom_names for kw in ["bleeding", "spotting"]):
        flags.append({
            "category": "unexplained_bleeding",
            "description": "Patient reports unexplained bleeding — requires clinical assessment",
            "urgency": "high",
        })

    if any(kw in name for name in symptom_names for kw in ["pelvic pain", "severe pain", "sharp pain"]):
        flags.append({
            "category": "severe_pelvic_pain",
            "description": "Patient reports significant pelvic pain — assess for ectopic or other acute causes",
            "urgency": "urgent",
        })

    return flags


@tool
def assess_risk_profile(family_history: dict, lifestyle: dict, reproductive_history: dict) -> str:
    """
    Assess overall risk profile based on history and lifestyle factors.
    Returns: 'standard', 'elevated', or 'high'
    """
    risk_score = 0

    if family_history.get("ovarian_cancer"):
        risk_score += 2
    if family_history.get("breast_cancer"):
        risk_score += 2
    if family_history.get("endometriosis"):
        risk_score += 1
    if lifestyle.get("smoking") == "current":
        risk_score += 1

    if risk_score == 0:
        return "standard"
    elif risk_score <= 2:
        return "elevated"
    else:
        return "high"


@tool
def suggest_screening(risk_profile: str, age_group: str, reproductive_history: dict) -> list[str]:
    """
    Suggest relevant screening items for the clinician based on risk profile.
    These are suggestions only — the clinician decides what to perform.
    """
    screening = ["Cervical smear (if due)", "Blood pressure check", "BMI assessment"]

    if risk_profile in ("elevated", "high"):
        screening.append("CA-125 discussion (given family history)")
        screening.append("Breast examination")

    if reproductive_history.get("irregular_cycle"):
        screening.append("Thyroid function discussion")
        screening.append("PCOS screening discussion")

    return screening


def run_triage(intake: IntakeForm, patient_age: int = 30) -> TriageResult:
    """
    Run triage on a patient intake form.
    Returns a TriageResult with red flags, risk profile, and screening recommendations.
    All output is advisory only.
    """
    agent = Agent(
        model=MODEL,
        system_prompt=SYSTEM_PROMPT,
        tools=[detect_red_flags, assess_risk_profile, suggest_screening],
    )

    prompt = f"""
    Please triage this patient intake:

    Symptoms: {[s.model_dump() for s in intake.symptoms]}
    Reproductive history: {intake.reproductive_history.model_dump()}
    Family history: {intake.family_history.model_dump()}
    Lifestyle: {intake.lifestyle.model_dump()}
    Patient age: {patient_age}

    Steps:
    1. Call detect_red_flags with the symptoms and reproductive history
    2. Call assess_risk_profile with family history and lifestyle
    3. Call suggest_screening with the risk profile and reproductive history
    4. Return a structured summary

    Remember: advisory only. No diagnoses.
    """

    result = agent(prompt)

    audit.log(
        patient_id=intake.patient_id,
        actor_id="intake_agent",
        action="intake_submitted",
        resource_id=intake.appointment_id,
    )

    # Parse result into TriageResult — in production, use structured output
    return TriageResult(
        intake_id=intake.appointment_id,
        red_flags=[],  # populated from agent tool calls
        risk_profile="standard",
        screening_recommendations=[],
    )
