import React from "react";
import { LifestyleFactors } from "../types";

interface Props { data: LifestyleFactors; onChange: (d: LifestyleFactors) => void; }

export default function LifestyleSection({ data, onChange }: Props) {
  const set = (patch: Partial<LifestyleFactors>) => onChange({ ...data, ...patch });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold" style={{ color: "#2D2D2D" }}>Lifestyle</h2>
        <p className="mt-1 text-sm text-gray-400">This helps your doctor understand your overall health picture. All optional.</p>
      </div>

      {/* Smoking */}
      <div>
        <label className="form-label">Smoking status</label>
        <div className="flex gap-3">
          {(["never", "former", "current"] as const).map((val) => (
            <label key={val} className={`flex-1 flex items-center justify-center rounded-xl border py-2.5 text-sm font-medium cursor-pointer transition ${
              data.smoking === val
                ? "border-pink-400 bg-pink-50 text-pink-700"
                : "border-pink-100 bg-white text-gray-500 hover:border-pink-300"
            }`}>
              <input type="radio" className="sr-only" name="smoking" value={val}
                checked={data.smoking === val} onChange={() => set({ smoking: val })} />
              {val.charAt(0).toUpperCase() + val.slice(1)}
            </label>
          ))}
        </div>
      </div>

      {/* Alcohol */}
      <div>
        <label className="form-label">Alcohol (units per week)</label>
        <input type="number" min={0} className="form-input max-w-xs" placeholder="e.g. 6"
          value={data.alcohol_units_per_week ?? ""}
          onChange={(e) => set({ alcohol_units_per_week: e.target.value ? Number(e.target.value) : null })} />
        <p className="mt-1 text-xs text-gray-300">1 unit ≈ a small glass of wine or half a pint of beer</p>
      </div>

      {/* Exercise */}
      <div>
        <label className="form-label">Exercise (days per week)</label>
        <div className="flex gap-2">
          {[0,1,2,3,4,5,6,7].map((n) => (
            <button key={n} type="button" onClick={() => set({ exercise_days_per_week: n })}
              className={`h-9 w-9 rounded-xl text-sm font-medium transition ${
                data.exercise_days_per_week === n
                  ? "text-white"
                  : "border border-pink-100 bg-white text-gray-500 hover:border-pink-300"
              }`}
              style={data.exercise_days_per_week === n ? { background: "linear-gradient(135deg, #F4A7B9, #E8728A)", border: "none" } : {}}>
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Stress */}
      <div>
        <label className="form-label">
          Stress level — <span className="font-normal text-gray-400">1 (very low) to 10 (very high)</span>
        </label>
        <div className="flex items-center gap-4">
          <input type="range" min={1} max={10} className="flex-1"
            style={{ accentColor: "#E8728A" }}
            value={data.stress_level ?? 5}
            onChange={(e) => set({ stress_level: Number(e.target.value) })} />
          <span className="w-8 text-center text-sm font-semibold text-pink-600">
            {data.stress_level ?? "—"}
          </span>
        </div>
        <div className="flex justify-between text-xs text-gray-300 mt-1">
          <span>Very low</span><span>Very high</span>
        </div>
      </div>
    </div>
  );
}
