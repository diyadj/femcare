import React, { useState, useEffect, useCallback, useRef } from "react";
import Shell from "../components/Shell";
import ProgressBar from "../components/ProgressBar";
import AutoSaveBadge from "../components/AutoSaveBadge";
import ProfileCard from "../components/ProfileCard";
import SymptomsSection from "../sections/SymptomsSection";
import ReproductiveSection from "../sections/ReproductiveSection";
import FamilyHistorySection from "../sections/FamilyHistorySection";
import LifestyleSection from "../sections/LifestyleSection";
import MedicationsSection from "../sections/MedicationsSection";
import QuestionsSection from "../sections/QuestionsSection";
import ConfirmationScreen from "../sections/ConfirmationScreen";
import { startIntake, saveProgress, submitIntake } from "../api";
import { IntakeFormData } from "../types";
import { getProfile, saveProfile, updateProfileSection, PatientProfile, MOCK_TIMELINE } from "../profileStore";

const TEST_PATIENT_ID    = "test-patient-001";
const TEST_APPOINTMENT_ID = "test-appt-001";

// ── Section definitions ───────────────────────────────────────────────────────
// Full set (first visit)
const ALL_SECTIONS = [
  { id: "symptoms",     label: "Symptoms" },
  { id: "reproductive", label: "Reproductive" },
  { id: "family",       label: "Family history" },
  { id: "lifestyle",    label: "Lifestyle" },
  { id: "medications",  label: "Medications" },
  { id: "questions",    label: "Questions" },
];

// Return visit — only symptoms + questions
const RETURN_SECTIONS = [
  { id: "symptoms",  label: "Symptoms" },
  { id: "questions", label: "Questions" },
];

// Review sections (things that change) — no family history
const REVIEW_SECTIONS = [
  { id: "reproductive", label: "Reproductive" },
  { id: "lifestyle",    label: "Lifestyle" },
  { id: "medications",  label: "Medications" },
];

type Mode = "full" | "return" | "review";

const defaultForm = (profile?: PatientProfile | null): IntakeFormData => ({
  patient_id:    TEST_PATIENT_ID,
  appointment_id: TEST_APPOINTMENT_ID,
  symptoms: [],
  reproductive_history: profile?.reproductive_history ?? {
    pregnancies: 0, live_births: 0, miscarriages: 0,
    current_contraception: "",
    menstrual_cycle: { cycle_length_days: null, period_duration_days: null, last_period_date: "", irregular: false, pain_level: null },
    last_smear_date: "", notes: "",
  },
  family_history: profile?.family_history ?? {
    ovarian_cancer: false, breast_cancer: false, endometriosis: false, pcos: false, other: "",
  },
  lifestyle: profile?.lifestyle ?? {
    smoking: "never", alcohol_units_per_week: null, exercise_days_per_week: null, stress_level: null,
  },
  medications: profile?.medications ?? [],
  patient_questions: "",
  consent_given_at: null,
  data_version: "1.0",
});

type SaveStatus = "idle" | "saving" | "saved" | "error";

export default function IntakePage() {
  const [profile, setProfile]           = useState<PatientProfile | null>(null);
  const [mode, setMode]                 = useState<Mode>("full");
  const [sections, setSections]         = useState(ALL_SECTIONS);
  const [step, setStep]                 = useState<number>(-1); // -1 = consent/welcome
  const [form, setForm]                 = useState<IntakeFormData>(defaultForm());
  const [intakeId, setIntakeId]         = useState<string | null>(null);
  const [saveStatus, setSaveStatus]     = useState<SaveStatus>("idle");
  const [submitting, setSubmitting]     = useState(false);
  const [submitError, setSubmitError]   = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<{ intakeId: string; message: string } | null>(null);
  const [consentChecked, setConsentChecked] = useState(false);
  const [starting, setStarting]         = useState(false);
  const [startError, setStartError]     = useState<string | null>(null);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load profile on mount
  useEffect(() => {
    const p = getProfile();
    setProfile(p);
    if (p) {
      setMode("return");
      setSections(RETURN_SECTIONS);
      setForm(defaultForm(p));
    }
  }, []);

  // Auto-save (debounced 2s)
  const triggerSave = useCallback((id: string, f: IntakeFormData) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaveStatus("saving");
      try {
        await saveProgress(id, f);
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 3000);
      } catch {
        setSaveStatus("error");
      }
    }, 2000);
  }, []);

  useEffect(() => {
    if (intakeId && step >= 0) triggerSave(intakeId, form);
  }, [form, intakeId, step, triggerSave]);

  // ── Start intake ──────────────────────────────────────────────────────────
  const handleStart = async () => {
    if (!consentChecked) return;
    setStarting(true);
    setStartError(null);
    try {
      const res = await startIntake(TEST_PATIENT_ID, TEST_APPOINTMENT_ID);
      setIntakeId(res.intake_id);
      setForm((f) => ({ ...f, consent_given_at: new Date().toISOString() }));
      setStep(0);
    } catch (e: any) {
      setStartError(e.message || "Something went wrong. Please try again.");
    } finally {
      setStarting(false);
    }
  };

  // ── Enter review mode ─────────────────────────────────────────────────────
  const handleStartReview = async () => {
    setSections(REVIEW_SECTIONS);
    setMode("review");
    setStarting(true);
    try {
      const res = await startIntake(TEST_PATIENT_ID, TEST_APPOINTMENT_ID);
      setIntakeId(res.intake_id);
      setForm((f) => ({ ...f, consent_given_at: new Date().toISOString() }));
      setStep(0);
    } catch {
      // silently continue — review is optional
    } finally {
      setStarting(false);
    }
  };

  // ── Navigation ────────────────────────────────────────────────────────────
  const goNext = () => setStep((s) => Math.min(s + 1, sections.length - 1));
  const goPrev = () => setStep((s) => Math.max(s - 1, 0));

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!intakeId) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await submitIntake(intakeId, form);

      // Save baseline profile after first full submission
      if (mode === "full") {
        const now = new Date().toISOString();
        saveProfile({
          basicInfo: profile?.basicInfo ?? { name: "", dob: "", language: "English" },
          reproductive_history: form.reproductive_history,
          family_history:       form.family_history,
          lifestyle:            form.lifestyle,
          medications:          form.medications,
          timeline:             profile?.timeline ?? MOCK_TIMELINE,
          reproUpdatedAt:       now,
          lifestyleUpdatedAt:   now,
          medicationsUpdatedAt: now,
        });
      }
      // Update profile after review
      if (mode === "review") {
        updateProfileSection({
          reproductive_history: form.reproductive_history,
          lifestyle:            form.lifestyle,
          medications:          form.medications,
        });
      }

      setConfirmation({ intakeId: res.intake_id, message: res.message });
    } catch (e: any) {
      setSubmitError(e.message || "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const isLastStep = step === sections.length - 1;
  const currentSectionId = sections[step]?.id;

  // ── Confirmation ──────────────────────────────────────────────────────────
  if (confirmation) {
    return (
      <Shell>
        <ConfirmationScreen intakeId={confirmation.intakeId} message={confirmation.message} />
      </Shell>
    );
  }

  // ── Welcome / consent screen ──────────────────────────────────────────────
  if (step === -1) {
    // Return visit — show profile card + short form option
    if (profile && mode === "return") {
      return (
        <Shell>
          <div className="max-w-lg mx-auto space-y-6 py-8">
            <div className="text-center space-y-1">
              <h1 className="text-2xl font-semibold" style={{ color: "#2D2D2D" }}>Welcome back 💕</h1>
              <p className="text-gray-400 text-sm">We've remembered your health profile. Just tell us about today.</p>
            </div>

            {/* Profile card */}
            <ProfileCard profile={profile} onReview={handleStartReview} />

            {/* What's new today */}
            <div className="card space-y-3">
              <p className="text-sm font-medium" style={{ color: "#2D2D2D" }}>For today's appointment we just need:</p>
              <ul className="space-y-2">
                {RETURN_SECTIONS.map((s) => (
                  <li key={s.id} className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="text-pink-400">✓</span> {s.label}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-gray-300 pt-1">
                Family history, reproductive history, lifestyle and medications are pre-filled from your last visit.
              </p>
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-pink-200 text-pink-500 focus:ring-pink-300"
                checked={consentChecked} onChange={(e) => setConsentChecked(e.target.checked)} />
              <span className="text-sm text-gray-500">
                I consent to sharing this information with my clinician for today's appointment.
              </span>
            </label>

            {startError && <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-2">{startError}</p>}

            <button type="button" onClick={handleStart} disabled={!consentChecked || starting} className="btn-primary w-full">
              {starting ? "Starting…" : "Continue →"}
            </button>
          </div>
        </Shell>
      );
    }

    // First visit — full consent screen
    return (
      <Shell>
        <div className="max-w-lg mx-auto space-y-6 py-8">
          <div className="text-center space-y-2">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-full mb-2"
              style={{ background: "linear-gradient(135deg, #FAE8EE, #F4A7B9)" }}>
              <svg className="h-7 w-7 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.955 11.955 0 003 12c0 6.627 5.373 12 12 12s12-5.373 12-12c0-2.13-.558-4.13-1.535-5.867" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold" style={{ color: "#2D2D2D" }}>Before we begin</h1>
            <p className="text-gray-400 text-sm">This form helps your doctor make the most of your appointment. It takes about 5 minutes.</p>
          </div>

          <div className="card space-y-4 text-sm text-gray-500">
            <p className="font-medium" style={{ color: "#2D2D2D" }}>How we use your information</p>
            <ul className="space-y-2">
              <li className="flex gap-2"><span className="text-pink-400 mt-0.5">✓</span> Your responses are encrypted and stored securely in Ireland (EU)</li>
              <li className="flex gap-2"><span className="text-pink-400 mt-0.5">✓</span> Only your clinician can see your full responses</li>
              <li className="flex gap-2"><span className="text-pink-400 mt-0.5">✓</span> AI is used to help summarise — never to make clinical decisions</li>
              <li className="flex gap-2"><span className="text-pink-400 mt-0.5">✓</span> We'll remember your profile so future visits take under 2 minutes</li>
            </ul>
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border-pink-200 text-pink-500 focus:ring-pink-300"
              checked={consentChecked} onChange={(e) => setConsentChecked(e.target.checked)} />
            <span className="text-sm text-gray-500">
              I understand how my data will be used and I consent to completing this form.
            </span>
          </label>

          {startError && <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-2">{startError}</p>}

          <button type="button" onClick={handleStart} disabled={!consentChecked || starting} className="btn-primary w-full">
            {starting ? "Starting…" : "Start my pre-visit form →"}
          </button>
        </div>
      </Shell>
    );
  }

  // ── Form steps ────────────────────────────────────────────────────────────
  const modeLabel = mode === "review" ? "Review & update" : mode === "return" ? "Today's check-in" : "Pre-visit form";

  return (
    <Shell>
      <div className="mb-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold" style={{ color: "#2D2D2D" }}>{modeLabel}</h1>
            {mode === "review" && (
              <p className="text-xs text-gray-400 mt-0.5">Only sections that may have changed since your last visit</p>
            )}
          </div>
          <AutoSaveBadge status={saveStatus} />
        </div>
        <ProgressBar steps={sections} currentIndex={step} />
      </div>

      {/* Profile card shown on return visits above the form */}
      {profile && mode === "return" && (
        <div className="mb-4">
          <ProfileCard profile={profile} onReview={handleStartReview} />
        </div>
      )}

      <div className="card min-h-[400px]">
        {currentSectionId === "symptoms"     && <SymptomsSection symptoms={form.symptoms} onChange={(symptoms) => setForm((f) => ({ ...f, symptoms }))} />}
        {currentSectionId === "reproductive" && <ReproductiveSection data={form.reproductive_history} onChange={(reproductive_history) => setForm((f) => ({ ...f, reproductive_history }))} />}
        {currentSectionId === "family"       && <FamilyHistorySection data={form.family_history} onChange={(family_history) => setForm((f) => ({ ...f, family_history }))} />}
        {currentSectionId === "lifestyle"    && <LifestyleSection data={form.lifestyle} onChange={(lifestyle) => setForm((f) => ({ ...f, lifestyle }))} />}
        {currentSectionId === "medications"  && <MedicationsSection medications={form.medications} onChange={(medications) => setForm((f) => ({ ...f, medications }))} />}
        {currentSectionId === "questions"    && <QuestionsSection questions={form.patient_questions} onChange={(patient_questions) => setForm((f) => ({ ...f, patient_questions }))} />}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <button type="button" onClick={goPrev} disabled={step === 0} className="btn-secondary disabled:opacity-40">← Back</button>
        <div className="flex flex-col items-end gap-2">
          {submitError && <p className="text-sm text-red-500">{submitError}</p>}
          {isLastStep ? (
            <button type="button" onClick={handleSubmit} disabled={submitting} className="btn-primary">
              {submitting ? "Submitting…" : "Submit →"}
            </button>
          ) : (
            <button type="button" onClick={goNext} className="btn-primary">Next →</button>
          )}
        </div>
      </div>
    </Shell>
  );
}
