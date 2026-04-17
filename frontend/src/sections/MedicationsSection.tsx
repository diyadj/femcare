import React from "react";
import { Medication } from "../types";

interface Props { medications: Medication[]; onChange: (m: Medication[]) => void; }

const empty = (): Medication => ({ name: "", dose: "", frequency: "" });

export default function MedicationsSection({ medications, onChange }: Props) {
  const add    = () => onChange([...medications, empty()]);
  const remove = (i: number) => onChange(medications.filter((_, idx) => idx !== i));
  const update = (i: number, patch: Partial<Medication>) =>
    onChange(medications.map((m, idx) => (idx === i ? { ...m, ...patch } : m)));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold" style={{ color: "#2D2D2D" }}>Medications</h2>
        <p className="mt-1 text-sm text-gray-400">Include prescription medicines, over-the-counter drugs, vitamins, and supplements.</p>
      </div>

      {medications.length === 0 ? (
        <div className="rounded-xl p-8 text-center" style={{ border: "1.5px dashed #F4A7B9", background: "#FDF6F8" }}>
          <p className="text-sm text-gray-400">No medications added yet.</p>
          <button type="button" onClick={add} className="btn-primary mt-4 text-sm">+ Add medication</button>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {medications.map((med, i) => (
              <div key={i} className="rounded-xl p-4" style={{ background: "#FDF6F8", border: "1px solid #F7D0DC" }}>
                <div className="flex items-start gap-3">
                  <div className="flex-1 grid grid-cols-3 gap-3">
                    <div>
                      <label className="form-label">Medication name</label>
                      <input className="form-input" placeholder="e.g. Metformin" value={med.name}
                        onChange={(e) => update(i, { name: e.target.value })} />
                    </div>
                    <div>
                      <label className="form-label">Dose</label>
                      <input className="form-input" placeholder="e.g. 500mg" value={med.dose}
                        onChange={(e) => update(i, { dose: e.target.value })} />
                    </div>
                    <div>
                      <label className="form-label">Frequency</label>
                      <input className="form-input" placeholder="e.g. Twice daily" value={med.frequency}
                        onChange={(e) => update(i, { frequency: e.target.value })} />
                    </div>
                  </div>
                  <button type="button" onClick={() => remove(i)}
                    className="mt-6 text-gray-300 hover:text-pink-500 transition text-xl leading-none" aria-label="Remove">×</button>
                </div>
              </div>
            ))}
          </div>
          <button type="button" onClick={add} className="btn-secondary text-sm">+ Add another medication</button>
        </>
      )}
    </div>
  );
}
