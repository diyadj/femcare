"""Intake router — pre-visit patient intake form endpoints."""
import uuid
from datetime import datetime

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from src.models.intake import IntakeForm
from src.utils.audit_logger import AuditLogger

router = APIRouter()
audit = AuditLogger()


class StartIntakeRequest(BaseModel):
    patient_id: str
    appointment_id: str
    consent_given: bool


class StartIntakeResponse(BaseModel):
    intake_id: str
    message: str


class SubmitIntakeResponse(BaseModel):
    intake_id: str
    status: str
    red_flags_detected: bool
    message: str


@router.post("/start", response_model=StartIntakeResponse, status_code=status.HTTP_201_CREATED)
def start_intake(request: StartIntakeRequest):
    """Create a new intake session. Records consent before any data collection."""
    if not request.consent_given:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Patient consent is required before starting the intake.",
        )

    intake_id = str(uuid.uuid4())

    audit.log(
        patient_id=request.patient_id,
        actor_id=request.patient_id,
        action="consent_given",
        resource_id=intake_id,
    )
    audit.log(
        patient_id=request.patient_id,
        actor_id=request.patient_id,
        action="intake_started",
        resource_id=intake_id,
    )

    # TODO: persist intake session to DynamoDB

    return StartIntakeResponse(
        intake_id=intake_id,
        message="Intake session started. Your data is encrypted and only visible to your clinician.",
    )


@router.put("/{intake_id}/save", status_code=status.HTTP_200_OK)
def save_progress(intake_id: str, form: IntakeForm):
    """Save partial intake form progress."""
    audit.log(
        patient_id=form.patient_id,
        actor_id=form.patient_id,
        action="intake_saved",
        resource_id=intake_id,
    )
    # TODO: encrypt and persist to DynamoDB
    return {"intake_id": intake_id, "status": "saved"}


@router.post("/{intake_id}/submit", response_model=SubmitIntakeResponse)
def submit_intake(intake_id: str, form: IntakeForm):
    """
    Submit completed intake form.
    Triggers AI triage and patient brief generation asynchronously.
    """
    form.submitted_at = datetime.utcnow()

    audit.log(
        patient_id=form.patient_id,
        actor_id=form.patient_id,
        action="intake_submitted",
        resource_id=intake_id,
    )

    # TODO: invoke IntakeAgent for triage
    # TODO: trigger BriefGeneratorAgent via Lambda async
    # TODO: notify clinician if red flags detected

    return SubmitIntakeResponse(
        intake_id=intake_id,
        status="processing",
        red_flags_detected=False,
        message="Your information has been received. Your doctor will have a summary before your appointment.",
    )


@router.get("/{intake_id}/status")
def get_status(intake_id: str):
    """Check brief generation status."""
    # TODO: query DynamoDB for intake status
    return {"intake_id": intake_id, "status": "processing"}
