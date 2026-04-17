import React from "react";

interface Step { id: string; label: string; }
interface Props { steps: Step[]; currentIndex: number; }

export default function ProgressBar({ steps, currentIndex }: Props) {
  const pct = Math.round((currentIndex / (steps.length - 1)) * 100);

  return (
    <div className="w-full">
      <div className="hidden md:flex justify-between mb-2">
        {steps.map((step, i) => (
          <span key={step.id} className={`text-xs font-medium transition-colors ${
            i <= currentIndex ? "text-pink-600" : "text-gray-300"
          }`}>
            {step.label}
          </span>
        ))}
      </div>

      <div className="h-1.5 w-full rounded-full bg-pink-100">
        <div
          className="h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: "linear-gradient(90deg, #F4A7B9, #E8728A)" }}
        />
      </div>

      <p className="mt-2 text-xs text-gray-400 md:hidden">
        Step {currentIndex + 1} of {steps.length} — {steps[currentIndex]?.label}
      </p>
    </div>
  );
}
