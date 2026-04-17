import React from "react";
import { Symptom } from "../types";

interface Props { symptoms: Symptom[]; onChange: (s: Symptom[]) => void; }

const COMMON_SYMPTOMS = [
  "Pelvic pain", "Irregular periods", "Heavy bleeding", "Unusual discharge",
  "Bloating", "Breast tenderness", "Painful intercourse", "Spotting between periods",
];

const emptySymptom = (): Symptom => ({ name: "", duration_days: null, severity: null, notes: "" });

export default function SymptomsSection({ symptoms, onChange }: Props) {
  const add    = () => onChange([...symptoms, emptySymptom()]);
  const remove = (i: number) => onChange(symptoms.filter((_, idx) => idx !== i));
  const update = (i: number, patch: Partial<Symptom>) =>
    onChange(symptoms.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));

  const toggleCommon = (name: string) => {
    const exists = symptoms.find((s) => s.name === name);
    if (exists) onChange(symptoms.filter((s) => s.name !== name));
    else onChange([...symptoms, { ...emptySymptom(), name }]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold" style={{ color: "#2D2D2D" }}>Current symptoms</h2>
        <p className="mt-1 text-sm text-gray-400">Tell us what's been on your mind. Select from the list or add your own.</p>
      </div>

      {/* Quick-select chips */}
      <div>
        <p className="form-label">Common symptoms</p>
        <div className="flex flex-wrap gap-2">
          {COMMON_SYMPTOMS.map((name) => {
            const active = symptoms.some((s) => s.name === name);
            return (
              <button key={name} type="button" onClick={() => toggleCommon(name)}
                className={`rounded-full border px-3 py-1 text-sm font-medium transition ${
                  active
                    ? "border-pink-400 bg-pink-50 text-pink-700"
                    : "border-pink-100 bg-white text-gray-500 hover:border-pink-300 hover:text-pink-600"
                }`}>
                {active && <span className="mr-1">✓</span>}{name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Detail cards */}
      {symptoms.length > 0 && (
        <div className="space-y-4">
          <p className="form-label">Tell us more (optional)</p>
          {symptoms.map((s, i) => (
            <div key={i} className="rounded-xl p-4 space-y-3" style={{ background: "#FDF6F8", border: "1px solid #F7D0DC" }}>
              <div className="flex items-center justify-between">
                <input className="form-input max-w-xs" placeholder="Symptom name" value={s.name}
                  onChange={(e) => update(i, { name: e.target.value })} />
                <button type="button" onClick={() => remove(i)}
                  className="ml-3 text-gray-300 hover:text-pink-500 transition text-xl leading-none" aria-label="Remove">×</button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">How long?</label>
                  <div className="flex items-center gap-2">
                    <input type="number" min={1} className="form-input w-24" placeholder="Days"
                      value={s.duration_days ?? ""}
                      onChange={(e) => update(i, { duration_days: e.target.value ? Number(e.target.value) : null })} />
                    <span className="text-sm text-gray-400">days</span>
                  </div>
                </div>
                <div>
                  <label className="form-label">Severity</label>
                  <select className="form-input" value={s.severity ?? ""}
                    onChange={(e) => update(i, { severity: (e.target.value as Symptom["severity"]) || null })}>
                    <option value="">Select…</option>
                    <option value="mild">Mild</option>
                    <option value="moderate">Moderate</option>
                    <option value="severe">Severe</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="form-label">Any extra notes?</label>
                <textarea className="form-input resize-none" rows={2}
                  placeholder="Anything else your doctor should know…"
                  value={s.notes} onChange={(e) => update(i, { notes: e.target.value })} />
              </div>
            </div>
          ))}
        </div>
      )}

      <button type="button" onClick={add} className="btn-secondary text-sm">+ Add another symptom</button>

      {symptoms.length === 0 && (
        <p className="text-sm text-gray-300 italic">No symptoms selected — that's fine, you can still continue.</p>
      )}
    </div>
  );
}
