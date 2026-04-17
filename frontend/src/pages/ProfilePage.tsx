import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Shell from "../components/Shell";
import FamilyHistorySection from "../sections/FamilyHistorySection";
import ReproductiveSection from "../sections/ReproductiveSection";
import LifestyleSection from "../sections/LifestyleSection";
import MedicationsSection from "../sections/MedicationsSection";
import { getProfile, updateProfileSection, clearProfile } from "../profileStore";
import { FamilyHistory, ReproductiveHistory, LifestyleFactors, Medication } from "../types";

type EditSection = "family" | "reproductive" | "lifestyle" | "medications" | null;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function SectionHeader({ title, updatedAt, onEdit }: { title: string; updatedAt?: string; onEdit: () => void }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div>
        <p className="text-xs font-semibold text-pink-400 uppercase tracking-widest">{title}</p>
        {updatedAt && <p className="text-xs text-gray-300 mt-0.5">Last updated: {formatDate(updatedAt)}</p>}
      </div>
      <button onClick={onEdit} className="text-xs font-medium text-pink-500 hover:text-pink-700 underline underline-offset-2 transition">
        Edit
      </button>
    </div>
  );
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(getProfile());
  const [editing, setEditing] = useState<EditSection>(null);

  // Local edit state
  const [editFamily,      setEditFamily]      = useState<FamilyHistory | null>(null);
  const [editRepro,       setEditRepro]       = useState<ReproductiveHistory | null>(null);
  const [editLifestyle,   setEditLifestyle]   = useState<LifestyleFactors | null>(null);
  const [editMedications, setEditMedications] = useState<Medication[] | null>(null);

  const startEdit = (section: EditSection) => {
    if (!profile) return;
    setEditing(section);
    if (section === "family")      setEditFamily(profile.family_history);
    if (section === "reproductive") setEditRepro(profile.reproductive_history);
    if (section === "lifestyle")   setEditLifestyle(profile.lifestyle);
    if (section === "medications") setEditMedications(profile.medications);
  };

  const saveEdit = () => {
    if (!profile) return;
    const patch: any = {};
    if (editing === "family"       && editFamily)      patch.family_history = editFamily;
    if (editing === "reproductive" && editRepro)       patch.reproductive_history = editRepro;
    if (editing === "lifestyle"    && editLifestyle)   patch.lifestyle = editLifestyle;
    if (editing === "medications"  && editMedications) patch.medications = editMedications;
    updateProfileSection(patch);
    setProfile(getProfile());
    setEditing(null);
  };

  // ── No profile ────────────────────────────────────────────────────────────
  if (!profile) {
    return (
      <Shell>
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="h-16 w-16 rounded-full flex items-center justify-center"
            style={{ background: "#FDF6F8", border: "1px solid #F4A7B9" }}>
            <svg className="h-8 w-8 text-pink-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold" style={{ color: "#2D2D2D" }}>No profile yet</h2>
            <p className="text-sm text-gray-400 mt-1">Set up your profile to get started.</p>
          </div>
          <button onClick={() => navigate("/setup")} className="btn-primary">Set up profile →</button>
        </div>
      </Shell>
    );
  }

  // ── Edit overlay ──────────────────────────────────────────────────────────
  if (editing) {
    return (
      <Shell>
        <div className="max-w-lg mx-auto space-y-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-gray-600 transition text-sm">← Back</button>
            <h1 className="text-lg font-semibold" style={{ color: "#2D2D2D" }}>
              {editing === "family"       && "Family history"}
              {editing === "reproductive" && "Reproductive history"}
              {editing === "lifestyle"    && "Lifestyle"}
              {editing === "medications"  && "Medications"}
            </h1>
          </div>

          <div className="card">
            {editing === "family"       && editFamily      && <FamilyHistorySection data={editFamily}      onChange={setEditFamily} />}
            {editing === "reproductive" && editRepro       && <ReproductiveSection  data={editRepro}       onChange={setEditRepro} />}
            {editing === "lifestyle"    && editLifestyle   && <LifestyleSection     data={editLifestyle}   onChange={setEditLifestyle} />}
            {editing === "medications"  && editMedications && <MedicationsSection   medications={editMedications} onChange={setEditMedications} />}
          </div>

          <div className="flex gap-3">
            <button onClick={() => setEditing(null)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={saveEdit} className="btn-primary flex-1">Save changes ✓</button>
          </div>
        </div>
      </Shell>
    );
  }

  // ── Profile view ──────────────────────────────────────────────────────────
  return (
    <Shell>
      <div className="max-w-lg mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold" style={{ color: "#2D2D2D" }}>My profile</h1>
          <span className="text-xs text-gray-300">Last saved: {formatDate(profile.savedAt)}</span>
        </div>

        {/* Personal info card */}
        <div className="card space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0"
              style={{ background: "linear-gradient(135deg, #F4A7B9, #E8728A)" }}>
              {profile.basicInfo.name.charAt(0).toUpperCase() || "?"}
            </div>
            <div>
              <p className="font-semibold" style={{ color: "#2D2D2D" }}>{profile.basicInfo.name || "—"}</p>
              <p className="text-xs text-gray-400">
                {profile.basicInfo.dob
                  ? `Born ${new Date(profile.basicInfo.dob).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`
                  : "Date of birth not set"}
                {" · "}{profile.basicInfo.language}
              </p>
            </div>
          </div>
        </div>

        {/* Family history */}
        <div className="card">
          <SectionHeader title="Family history" onEdit={() => startEdit("family")} />
          <div className="flex flex-wrap gap-2">
            {(["ovarian_cancer", "breast_cancer", "endometriosis", "pcos"] as const).map((key) => (
              profile.family_history[key] && (
                <span key={key} className="text-xs px-2.5 py-1 rounded-full"
                  style={{ background: "#FDF6F8", color: "#E8728A", border: "1px solid #F4A7B9" }}>
                  {key.replace(/_/g, " ")}
                </span>
              )
            ))}
            {!profile.family_history.ovarian_cancer && !profile.family_history.breast_cancer &&
             !profile.family_history.endometriosis  && !profile.family_history.pcos && (
              <p className="text-sm text-gray-300">No conditions noted</p>
            )}
            {profile.family_history.other && (
              <p className="text-xs text-gray-400 mt-1 w-full">{profile.family_history.other}</p>
            )}
          </div>
        </div>

        {/* Reproductive history */}
        <div className="card">
          <SectionHeader title="Reproductive history" updatedAt={profile.reproUpdatedAt} onEdit={() => startEdit("reproductive")} />
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { label: "Pregnancies", value: profile.reproductive_history.pregnancies },
              { label: "Live births",  value: profile.reproductive_history.live_births },
              { label: "Miscarriages", value: profile.reproductive_history.miscarriages },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl py-3" style={{ background: "#FDF6F8" }}>
                <p className="text-xl font-bold text-pink-500">{value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
          {profile.reproductive_history.current_contraception && (
            <p className="text-xs text-gray-500 mt-3">
              <span className="text-pink-400">Contraception:</span> {profile.reproductive_history.current_contraception}
            </p>
          )}
        </div>

        {/* Lifestyle */}
        <div className="card">
          <SectionHeader title="Lifestyle" updatedAt={profile.lifestyleUpdatedAt} onEdit={() => startEdit("lifestyle")} />
          <div className="flex flex-wrap gap-3 text-xs text-gray-500">
            <span><span className="text-pink-400">Smoking:</span> {profile.lifestyle.smoking}</span>
            {profile.lifestyle.alcohol_units_per_week != null && (
              <span><span className="text-pink-400">Alcohol:</span> {profile.lifestyle.alcohol_units_per_week} units/wk</span>
            )}
            {profile.lifestyle.exercise_days_per_week != null && (
              <span><span className="text-pink-400">Exercise:</span> {profile.lifestyle.exercise_days_per_week} days/wk</span>
            )}
            {profile.lifestyle.stress_level != null && (
              <span><span className="text-pink-400">Stress:</span> {profile.lifestyle.stress_level}/10</span>
            )}
          </div>
        </div>

        {/* Medications */}
        <div className="card">
          <SectionHeader title="Medications" updatedAt={profile.medicationsUpdatedAt} onEdit={() => startEdit("medications")} />
          {profile.medications.length === 0 ? (
            <p className="text-sm text-gray-300">No medications listed</p>
          ) : (
            <div className="space-y-2">
              {profile.medications.map((m, i) => (
                <div key={i} className="flex items-center justify-between text-sm rounded-xl px-3 py-2"
                  style={{ background: "#FDF6F8" }}>
                  <span className="font-medium" style={{ color: "#2D2D2D" }}>{m.name}</span>
                  <span className="text-xs text-gray-400">{m.dose} · {m.frequency}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Health timeline */}
        <div className="card">
          <p className="text-xs font-semibold text-pink-400 uppercase tracking-widest mb-3">Health timeline</p>
          {profile.timeline.length === 0 ? (
            <p className="text-sm text-gray-300">No past appointments yet</p>
          ) : (
            <div className="space-y-3">
              {profile.timeline.map((visit, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="h-2.5 w-2.5 rounded-full mt-1 shrink-0" style={{ background: "#F4A7B9" }} />
                    {i < profile.timeline.length - 1 && (
                      <div className="w-px flex-1 mt-1" style={{ background: "#F7D0DC" }} />
                    )}
                  </div>
                  <div className="pb-3">
                    <p className="text-xs text-gray-400">
                      {new Date(visit.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                      {" · "}{visit.doctorName}
                    </p>
                    <p className="text-sm text-gray-600 mt-0.5">{visit.outcome}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Danger zone */}
        <div className="text-center pb-4">
          <button onClick={() => { clearProfile(); setProfile(null); }}
            className="text-xs text-gray-300 hover:text-pink-500 transition underline underline-offset-2">
            Delete my profile
          </button>
        </div>
      </div>
    </Shell>
  );
}
