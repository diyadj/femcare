"""
SummaryAgent — generates the patient-facing post-visit summary using Strands SDK.

Output is always in plain, non-clinical language (target: Flesch-Kincaid Grade 8).
The summary is what the patient receives after their appointment.
"""
from strands import Agent, tool
from strands.models import BedrockModel

from src.utils.audit_logger import AuditLogger

audit = AuditLogger()

MODEL = BedrockModel(
    model_id="anthropic.claude-sonnet-4-5",
    region_name="eu-west-1",
)

SYSTEM_PROMPT = """You are a patient communication assistant for a gynaecological health platform.

Your task is to translate clinical visit notes into a plain-language summary for the patient.

Rules:
- Write for a non-medical audience — target Grade 8 reading level
- Never use medical jargon without immediately explaining it
- Be warm, reassuring, and clear — never alarming without cause
- Follow-up actions must be specific: what to do, by when, how
- Always end with: "If you have any concerns before your next appointment, contact your clinic."
- All output is a summary of what the clinician recorded — it is not medical advice
- Include is_advisory: true flag in metadata
"""


@tool
def simplify_clinical_text(clinical_notes: str) -> str:
    """
    Translate clinical notes into plain language for the patient.
    Replaces jargon, explains terms, keeps tone warm and clear.
    """
    replacements = {
        "cervical smear": "cervical screening test (smear test)",
        "dysmenorrhoea": "period pain",
        "amenorrhoea": "absence of periods",
        "endometrium": "the lining of your womb",
        "PCOS": "polycystic ovary syndrome (PCOS)",
        "STI": "sexually transmitted infection (STI)",
        "BMI": "body mass index (BMI)",
    }
    text = clinical_notes
    for term, plain in replacements.items():
        text = text.replace(term, plain)
    return text


@tool
def format_follow_up_actions(actions: list[dict]) -> list[str]:
    """
    Format follow-up actions into clear, actionable instructions.
    Each action: what to do, by when, where/how.
    """
    formatted = []
    for action in actions:
        task = action.get("task", "")
        deadline = action.get("deadline", "")
        how = action.get("how", "")

        if deadline and how:
            formatted.append(f"{task} — by {deadline} — {how}")
        elif deadline:
            formatted.append(f"{task} — by {deadline}")
        else:
            formatted.append(task)

    return formatted


@tool
def schedule_reminders(patient_id: str, actions: list[dict]) -> list[str]:
    """
    Schedule automated reminders for follow-up actions via SES.
    Returns list of scheduled reminder IDs.
    """
    reminder_ids = []
    for action in actions:
        reminder_id = f"reminder-{patient_id}-{action.get('task', 'followup')[:20]}"
        # TODO: write to DynamoDB reminder table, trigger EventBridge rule
        reminder_ids.append(reminder_id)
    return reminder_ids


def generate_visit_summary(
    patient_id: str,
    appointment_id: str,
    clinical_notes: str,
    follow_up_actions: list[dict],
) -> dict:
    """
    Generate a plain-language post-visit summary for the patient.
    Schedules follow-up reminders automatically.
    """
    agent = Agent(
        model=MODEL,
        system_prompt=SYSTEM_PROMPT,
        tools=[simplify_clinical_text, format_follow_up_actions, schedule_reminders],
    )

    prompt = f"""
    Generate a post-visit summary for a patient.

    Clinical notes from the visit: {clinical_notes}
    Follow-up actions required: {follow_up_actions}
    Patient ID (for reminders): {patient_id}

    Steps:
    1. Call simplify_clinical_text to translate the clinical notes
    2. Call format_follow_up_actions to make actions clear and specific
    3. Call schedule_reminders to set up automated follow-up reminders
    4. Return the complete summary in plain language

    Remember: Grade 8 reading level. Warm tone. No jargon without explanation.
    End with the standard contact message.
    """

    result = agent(prompt)

    audit.log(
        patient_id=patient_id,
        actor_id="summary_agent",
        action="brief_generated",
        resource_id=appointment_id,
    )

    return {
        "patient_id": patient_id,
        "appointment_id": appointment_id,
        "summary": str(result),
        "is_advisory": True,
        "model_version": "anthropic.claude-sonnet-4-5",
    }
