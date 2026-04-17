import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Shell from "../components/Shell";
import ProgressBar from "../components/ProgressBar";
import FamilyHistorySection from "../sections/FamilyHistorySection";
import ReproductiveSection from "../sections/ReproductiveSection";
import LifestyleSection from "../sections/LifestyleSection";
import MedicationsSection from "../sections/MedicationsSection";
import { saveProfile, MOCK_TIMELINE } from "../profileStore";
import { FamilyHistory, ReproductiveHistory, LifestyleFactors, Medication } from "../types";

const STEPS = [
  { id: "basic",        label: "About you" },
  { id: "family",       label: "Family history" },
  { id: "reproductive", label: "Reproductive" },
  { id: "lifestyle",    label: "Lifestyle" },
];

const LANGUAGES = ["English", "German", "French", "Spanish", "Irish", "Polish", "Other"];

export default function ProfileSetupPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  // Step 1 — basic info
  const [name, setName]         = useState("");
  const [dob, setDob]           = useState("");
  const [language, setLanguage] = useState("English");

  // Step 2 — family history
  const [familyHistory, setFamilyHistory] = useState<FamilyHistory>({
    ovarian_cancer: false, breast_cancer: false, endometriosis: false, pcos: false, other: "",
  });

  // Step 3 — reproductive
  const [reproHistory, setReproHistory] = useState<ReproductiveHistory>({
    pregnancies: 0, live_births: 0, miscarriages: 0, current_contraception: "",
    menstrual_cycle: { cycle_length_days: null, period_duration_days: null, last_period_date: "", irregular: false, pain_level: null },
    last_smear_date: "", notes: "",
  });

  // Step 4 — lifestyle + medications
  const [lifestyle, setLifestyle] = useState<LifestyleFactors>({
    smoking: "never", alcohol_units_per_week: null, exercise_days_per_week: null, stress_level: null,
  });
  const [medications, setMedications] = useState<Medication[]>([]);

  const goNext = () => setStep((s) => s + 1);
  const goPrev = () => setStep((s) => s - 1);

  const handleFinish = () => {
    const now = new Date().toISOString();
    saveProfile({
      basicInfo: { name, dob, language },
      reproductive_history: reproHistory,
      family_history: familyHistory,
      lifestyle,
      medications,
      timeline: MOCK_TIMELINE,
      reproUpdatedAt:       now,
      lifestyleUpdatedAt:   now,
      medicationsUpdatedAt: now,
    });
    navigate("/setup/complete");
  };

  const isLastStep = step === STEPS.length - 1;

  // ── Completion screen ─────────────────────────────────────────────────────
  if (step === STEPS.length) {
    return null; // handled by route
  }

  return (
    <Shell>
      <div className="max-w-lg mx-auto space-y-6">
        {/* Header */}
        <div>
          <p className="text-xs text-pink-400 font-semibold uppercase tracking-widest mb-1">Profile setup</p>
          <h1 className="text-xl font-semibold" style={{ color: "#2D2D2D" }}>
            {step === 0 && "Tell us about yourself"}
            {step === 1 && "Family health history"}
            {step === 2 && "Reproductive history"}
            {step === 3 && "Lifestyle & medications"}
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {step === 0 && "This helps us personalise your experience."}
            {step === 1 && "Filled once — we'll never ask again."}
            {step === 2 && "Your baseline — we'll pre-fill this on future visits."}
            {step === 3 && "Last step — you're almost done!"}
          </p>
        </div>

        <ProgressBar steps={STEPS} currentIndex={step} />

        {/* Step content */}
        <div className="card min-h-[360px]">
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <label className="form-label">Your name</label>
                <input className="form-input" placeholder="e.g. Sarah" value={name}
                  onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <label className="form-label">Date of birth</label>
                <input type="date" className="form-input" value={dob}
                  onChange={(e) => setDob(e.target.value)} />
              </div>
              <div>
                <label className="form-label">Preferred language</label>
                <select className="form-input" value={language} onChange={(e) => setLanguage(e.target.value)}>
                  {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
                </select>
              </div>
            </div>
          )}

          {step === 1 && (
            <FamilyHistorySection data={familyHistory} onChange={setFamilyHistory} />
          )}

          {step === 2 && (
            <ReproductiveSection data={reproHistory} onChange={setReproHistory} />
          )}

          {step === 3 && (
            <div className="space-y-8">
              <LifestyleSection data={lifestyle} onChange={setLifestyle} />
              <div className="border-t pt-6" style={{ borderColor: "#F7D0DC" }}>
                <MedicationsSection medications={medications} onChange={setMedications} />
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          {step > 0 ? (
            <button onClick={goPrev} className="btn-secondary">← Back</button>
          ) : (
            <button onClick={() => navigate("/")} className="btn-secondary">← Home</button>
          )}
          {isLastStep ? (
            <button onClick={handleFinish} className="btn-primary">Save profile ✓</button>
          ) : (
            <button onClick={goNext} className="btn-primary">Next →</button>
          )}
        </div>

        {/* Skip */}
        <p className="text-center text-xs text-gray-300">
          <button onClick={() => navigate("/scheduling")} className="hover:text-pink-400 transition underline underline-offset-2">
            Skip setup — I'll do this later
          </button>
        </p>
      </div>
    </Shell>
  );
}
