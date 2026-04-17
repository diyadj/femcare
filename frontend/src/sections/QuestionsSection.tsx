import React from "react";

interface Props { questions: string; onChange: (q: string) => void; }

const PROMPTS = [
  "What does my smear test result mean?",
  "Should I change my contraception?",
  "I've been feeling more anxious lately — is that hormonal?",
  "Can you check my last blood test results?",
  "I'd like to discuss my fertility options.",
];

export default function QuestionsSection({ questions, onChange }: Props) {
  const addPrompt = (p: string) => {
    const current = questions.trim();
    onChange(current ? `${current}\n${p}` : p);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold" style={{ color: "#2D2D2D" }}>Questions for your doctor</h2>
        <p className="mt-1 text-sm text-gray-400">This is your time. Write down anything you want to make sure you cover in your appointment.</p>
      </div>

      {/* Prompt chips */}
      <div>
        <p className="form-label">Need inspiration?</p>
        <div className="flex flex-wrap gap-2">
          {PROMPTS.map((p) => (
            <button key={p} type="button" onClick={() => addPrompt(p)}
              className="rounded-full border border-pink-100 bg-white px-3 py-1 text-xs text-gray-500 hover:border-pink-300 hover:text-pink-600 transition">
              {p}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="form-label">Your questions</label>
        <textarea className="form-input resize-none" rows={8}
          placeholder="Write your questions here, one per line…"
          value={questions} onChange={(e) => onChange(e.target.value)} />
        <p className="mt-1.5 text-xs text-gray-300">
          {questions.trim() ? `${questions.trim().split("\n").filter(Boolean).length} question(s) noted` : "No questions yet — that's fine too."}
        </p>
      </div>
    </div>
  );
}
