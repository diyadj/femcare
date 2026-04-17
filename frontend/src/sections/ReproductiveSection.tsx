import React from "react";
import { ReproductiveHistory } from "../types";

interface Props { data: ReproductiveHistory; onChange: (d: ReproductiveHistory) => void; }

export default function ReproductiveSection({ data, onChange }: Props) {
  const set      = (patch: Partial<ReproductiveHistory>) => onChange({ ...data, ...patch });
  const setCycle = (patch: Partial<ReproductiveHistory["menstrual_cycle"]>) =>
    onChange({ ...data, menstrual_cycle: { ...data.menstrual_cycle, ...patch } });

  const sectionStyle = { border: "1px solid #F7D0DC" };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold" style={{ color: "#2D2D2D" }}>Reproductive history</h2>
        <p className="mt-1 text-sm text-gray-400">All fields are optional. Share only what you're comfortable with.</p>
      </div>

      {/* Pregnancy history */}
      <div className="card space-y-4" style={sectionStyle}>
        <h3 className="text-xs font-semibold text-pink-400 uppercase tracking-widest">Pregnancy history</h3>
        <div className="grid grid-cols-3 gap-4">
          {([
            { key: "pregnancies", label: "Pregnancies" },
            { key: "live_births", label: "Live births" },
            { key: "miscarriages", label: "Miscarriages" },
          ] as const).map(({ key, label }) => (
            <div key={key}>
              <label className="form-label">{label}</label>
              <input type="number" min={0} className="form-input" value={data[key]}
                onChange={(e) => set({ [key]: Number(e.target.value) })} />
            </div>
          ))}
        </div>
      </div>

      {/* Menstrual cycle */}
      <div className="card space-y-4" style={sectionStyle}>
        <h3 className="text-xs font-semibold text-pink-400 uppercase tracking-widest">Menstrual cycle</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">Cycle length (days)</label>
            <input type="number" min={1} className="form-input" placeholder="e.g. 28"
              value={data.menstrual_cycle.cycle_length_days ?? ""}
              onChange={(e) => setCycle({ cycle_length_days: e.target.value ? Number(e.target.value) : null })} />
          </div>
          <div>
            <label className="form-label">Period duration (days)</label>
            <input type="number" min={1} className="form-input" placeholder="e.g. 5"
              value={data.menstrual_cycle.period_duration_days ?? ""}
              onChange={(e) => setCycle({ period_duration_days: e.target.value ? Number(e.target.value) : null })} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">Last period date</label>
            <input type="date" className="form-input" value={data.menstrual_cycle.last_period_date || ""}
              onChange={(e) => setCycle({ last_period_date: e.target.value })} />
          </div>
          <div>
            <label className="form-label">Pain level (1–10)</label>
            <input type="number" min={1} max={10} className="form-input" placeholder="1 = none, 10 = severe"
              value={data.menstrual_cycle.pain_level ?? ""}
              onChange={(e) => setCycle({ pain_level: e.target.value ? Number(e.target.value) : null })} />
          </div>
        </div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox"
            className="h-4 w-4 rounded border-pink-200 text-pink-500 focus:ring-pink-300"
            checked={data.menstrual_cycle.irregular}
            onChange={(e) => setCycle({ irregular: e.target.checked })} />
          <span className="text-sm text-gray-600">My cycle is irregular</span>
        </label>
      </div>

      {/* Contraception & screening */}
      <div className="card space-y-4" style={sectionStyle}>
        <h3 className="text-xs font-semibold text-pink-400 uppercase tracking-widest">Contraception & screening</h3>
        <div>
          <label className="form-label">Current contraception</label>
          <input className="form-input" placeholder="e.g. Combined pill, IUD, none…"
            value={data.current_contraception}
            onChange={(e) => set({ current_contraception: e.target.value })} />
        </div>
        <div>
          <label className="form-label">Date of last cervical smear</label>
          <input type="date" className="form-input" value={data.last_smear_date || ""}
            onChange={(e) => set({ last_smear_date: e.target.value })} />
        </div>
        <div>
          <label className="form-label">Anything else to add?</label>
          <textarea className="form-input resize-none" rows={3}
            placeholder="Any other reproductive health history you'd like your doctor to know…"
            value={data.notes} onChange={(e) => set({ notes: e.target.value })} />
        </div>
      </div>
    </div>
  );
}
