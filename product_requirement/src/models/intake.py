from __future__ import annotations
from datetime import datetime
from typing import Literal
from pydantic import BaseModel, Field


class Symptom(BaseModel):
    name: str
    duration_days: int | None = None
    severity: Literal["mild", "moderate", "severe"] | None = None
    notes: str | None = None


class MenstrualCycle(BaseModel):
    cycle_length_days: int | None = None
    period_duration_days: int | None = None
    last_period_date: str | None = None  # ISO date string
    irregular: bool = False
    pain_level: int | None = Field(None, ge=1, le=10)


class ReproductiveHistory(BaseModel):
    pregnancies: int = 0
    live_births: int = 0
    miscarriages: int = 0
    current_contraception: str | None = None
    menstrual_cycle: MenstrualCycle | None = None
    last_smear_date: str | None = None
    notes: str | None = None


class FamilyHistory(BaseModel):
    ovarian_cancer: bool = False
    breast_cancer: bool = False
    endometriosis: bool = False
    pcos: bool = False
    other: str | None = None


class LifestyleFactors(BaseModel):
    smoking: Literal["never", "former", "current"] = "never"
    alcohol_units_per_week: int | None = None
    exercise_days_per_week: int | None = None
    stress_level: int | None = Field(None, ge=1, le=10)


class Medication(BaseModel):
    name: str
    dose: str | None = None
    frequency: str | None = None


class IntakeForm(BaseModel):
    patient_id: str
    appointment_id: str
    submitted_at: datetime = Field(default_factory=datetime.utcnow)
    symptoms: list[Symptom] = []
    reproductive_history: ReproductiveHistory = Field(default_factory=ReproductiveHistory)
    family_history: FamilyHistory = Field(default_factory=FamilyHistory)
    lifestyle: LifestyleFactors = Field(default_factory=LifestyleFactors)
    medications: list[Medication] = []
    patient_questions: str = ""
    consent_given_at: datetime | None = None
    data_version: str = "1.0"


class RedFlag(BaseModel):
    category: Literal[
        "unexplained_bleeding",
        "severe_pelvic_pain",
        "possible_ectopic",
        "domestic_abuse",
        "mental_health_crisis",
    ]
    description: str
    urgency: Literal["urgent", "high", "medium"]
    escalated_at: datetime = Field(default_factory=datetime.utcnow)
    escalation_channel: str = "email"


class TriageResult(BaseModel):
    intake_id: str
    red_flags: list[RedFlag] = []
    risk_profile: Literal["standard", "elevated", "high"] = "standard"
    screening_recommendations: list[str] = []
    triage_completed_at: datetime = Field(default_factory=datetime.utcnow)


class PatientBrief(BaseModel):
    brief_id: str
    patient_id: str
    appointment_id: str
    generated_at: datetime = Field(default_factory=datetime.utcnow)
    concern_summary: str
    history_flags: list[str] = []
    red_flags: list[RedFlag] = []
    suggested_screening: list[str] = []
    patient_questions: str = ""
    is_advisory: bool = True  # always True — never change this
    confidence_level: float = Field(..., ge=0.0, le=1.0)
    model_version: str


class AuditEvent(BaseModel):
    event_id: str
    patient_id: str
    actor_id: str  # user or system ID — never store name
    action: Literal[
        "intake_started",
        "intake_saved",
        "intake_submitted",
        "brief_generated",
        "brief_accessed",
        "red_flag_raised",
        "consent_given",
        "data_deleted",
    ]
    resource_id: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    ip_address: str | None = None  # hashed, not raw
