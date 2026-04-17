"""Unit tests for intake data models."""
import pytest
from datetime import datetime
from src.models.intake import (
    IntakeForm, Symptom, RedFlag, TriageResult,
    PatientBrief, AuditEvent, ReproductiveHistory, FamilyHistory, LifestyleFactors
)


def test_intake_form_defaults():
    form = IntakeForm(patient_id="p-123", appointment_id="a-456")
    assert form.symptoms == []
    assert form.medications == []
    assert form.data_version == "1.0"
    assert form.patient_questions == ""


def test_intake_form_consent_not_required_by_default():
    form = IntakeForm(patient_id="p-123", appointment_id="a-456")
    assert form.consent_given_at is None


def test_patient_brief_is_always_advisory():
    brief = PatientBrief(
        brief_id="b-001",
        patient_id="p-123",
        appointment_id="a-456",
        concern_summary="Patient reports mild symptoms.",
        confidence_level=0.85,
        model_version="claude-sonnet-4-5",
    )
    assert brief.is_advisory is True


def test_patient_brief_confidence_level_bounds():
    with pytest.raises(Exception):
        PatientBrief(
            brief_id="b-001",
            patient_id="p-123",
            appointment_id="a-456",
            concern_summary="Test",
            confidence_level=1.5,  # invalid — must be 0.0-1.0
            model_version="claude-sonnet-4-5",
        )


def test_red_flag_urgency_values():
    flag = RedFlag(
        category="unexplained_bleeding",
        description="Test flag",
        urgency="urgent",
    )
    assert flag.urgency == "urgent"
    assert flag.is_advisory is not False  # RedFlag has no is_advisory — brief does


def test_audit_event_action_values():
    event = AuditEvent(
        event_id="e-001",
        patient_id="p-123",
        actor_id="p-123",
        action="consent_given",
        resource_id="i-001",
    )
    assert event.action == "consent_given"
    assert isinstance(event.timestamp, datetime)


def test_lifestyle_smoking_default():
    lifestyle = LifestyleFactors()
    assert lifestyle.smoking == "never"


def test_symptom_severity_optional():
    symptom = Symptom(name="headache")
    assert symptom.severity is None
    assert symptom.duration_days is None
