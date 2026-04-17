import React from "react";
import { FamilyHistory } from "../types";

interface Props { data: FamilyHistory; onChange: (d: FamilyHistory) => void; }

const CONDITIONS: { key: keyof Omit<FamilyHistory, "other">; label: string; description: string }[] = [
  { key: "ovarian_cancer", label: "Ovarian cancer",                    description: "In a first-degree relative (parent, sibling, child)" },
  { key: "breast_cancer",  label: "Breast cancer",                     description: "In a first-degree relative" },
  { key: "endometriosis",  label: "Endometriosis",                     description: "Diagnosed in a close family member" },
  { key: "pcos",           label: "Polycystic ovary syndrome (PCOS)",  description: "Diagnosed in a close family member" },
];

export default function FamilyHistorySection({ data, onChange }: Props) {
  const toggle = (key: keyof Omit<FamilyHistory, "other">) => onChange({ ...data, [key]: !data[key] });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold" style={{ color: "#2D2D2D" }}>Family history</h2>
        <p className="mt-1 text-sm text-gray-400">Knowing your family history helps us tailor screening recommendations for you.</p>
      </div>

      <div className="space-y-3">
        {CONDITIONS.map(({ key, label, description }) => (
          <label key={key} className={`flex items-start gap-4 rounded-xl p-4 cursor-pointer transition ${
            data[key] ? "border-pink-300 bg-pink-50" : "bg-white hover:border-pink-200"
          }`} style={{ border: `1px solid ${data[key] ? "#F4A7B9" : "#F7D0DC"}` }}>
            <input type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border-pink-200 text-pink-500 focus:ring-pink-300"
              checked={data[key]} onChange={() => toggle(key)} />
            <div>
              <p className="text-sm font-medium" style={{ color: "#2D2D2D" }}>{label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{description}</p>
            </div>
          </label>
        ))}
      </div>

      <div>
        <label className="form-label">Other family history</label>
        <textarea className="form-input resize-none" rows={3}
          placeholder="Any other conditions in your family that might be relevant…"
          value={data.other} onChange={(e) => onChange({ ...data, other: e.target.value })} />
      </div>
    </div>
  );
}
