import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import Shell from "../components/Shell";

// ── Mock summary data ─────────────────────────────────────────────────────────
const MOCK_SUMMARY = {
  date: "Thursday, 17 April 2026",
  doctor: "Dr. Sarah O'Brien",
  clinic: "FemCare Clinic, Dublin",

  discussed: [
    "You mentioned irregular periods over the past 3 months and some pelvic discomfort.",
    "Your contraception was reviewed — you're currently on the combined pill.",
    "We talked about your family history of endometriosis and what symptoms to watch for.",
    "Your stress levels and their potential impact on your cycle were discussed.",
  ],

  results: [
    { label: "Cervical smear (HPV test)", result: "Normal — no action needed", ok: true },
    { label: "Blood pressure", result: "120/78 — within healthy range", ok: true },
    { label: "Iron levels", result: "Slightly low — see follow-up actions", ok: false },
  ],

  followUp: [
    { action: "Book a blood test to check iron levels", deadline: "Within 2 weeks", link: null },
    { action: "Start iron-rich foods or consider a supplement — ask your pharmacist", deadline: "This week", link: null },
    { action: "Book your next annual check-up", deadline: "In 12 months", link: "/scheduling" },
    { action: "Contact the clinic if pelvic pain worsens or you experience unusual bleeding", deadline: "As needed", link: null },
  ],

  nextAppointmentRecommended: true,
};

export default function VisitSummaryPage() {
  const navigate = useNavigate();
  const printRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = () => {
    window.print();
  };

  return (
    <>
      {/* Print-only styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .print-card { box-shadow: none !important; border: 1px solid #e5e7eb !important; }
        }
      `}</style>

      <Shell>
        <div ref={printRef} className="max-w-2xl mx-auto space-y-6">

          {/* ── Header ── */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Visit summary</p>
              <h1 className="text-2xl font-semibold text-gray-900 mt-1">
                Here's what happened at your appointment
              </h1>
              <p className="text-sm text-gray-500 mt-1">{MOCK_SUMMARY.date} · {MOCK_SUMMARY.doctor} · {MOCK_SUMMARY.clinic}</p>
            </div>
            <button
              onClick={handleDownloadPDF}
              className="no-print btn-secondary text-sm shrink-0 flex items-center gap-2"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Download PDF
            </button>
          </div>

          {/* ── What was discussed ── */}
          <div className="card print-card space-y-3">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">What we discussed</h2>
            <ul className="space-y-2">
              {MOCK_SUMMARY.discussed.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                  <span className="text-sage-500 mt-0.5 shrink-0">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* ── Your results ── */}
          <div className="card print-card space-y-3">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Your results</h2>
            <div className="space-y-2">
              {MOCK_SUMMARY.results.map((r, i) => (
                <div key={i} className={`flex items-center justify-between rounded-xl px-4 py-3`}
                  style={r.ok
                    ? { background: "#F5F0FB", border: "1px solid #DACCF0" }
                    : { background: "#FDF6F8", border: "1px solid #F4A7B9" }}>
                  <div>
                    <p className="text-sm font-medium" style={{ color: "#2D2D2D" }}>{r.label}</p>
                    <p className={`text-xs mt-0.5`} style={{ color: r.ok ? "#7D5AA8" : "#E85C7A" }}>{r.result}</p>
                  </div>
                  <span className="text-lg">{r.ok ? "✓" : "⚠️"}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── What to do next ── */}
          <div className="card print-card space-y-3">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">What to do next</h2>
            <div className="space-y-2">
              {MOCK_SUMMARY.followUp.map((item, i) => (
                <div key={i} className="flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full text-white text-xs font-bold shrink-0 mt-0.5"
                    style={{ background: "linear-gradient(135deg, #F4A7B9, #E8728A)" }}>
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm text-gray-800">{item.action}</p>
                    <p className="text-xs text-gray-400 mt-0.5">⏱ {item.deadline}</p>
                  </div>
                  {item.link && (
                    <button
                      onClick={() => navigate(item.link!)}
                      className="no-print text-xs font-medium text-sage-600 hover:text-sage-800 underline underline-offset-2 shrink-0"
                    >
                      Book now →
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ── Next appointment ── */}
          {MOCK_SUMMARY.nextAppointmentRecommended && (
            <div className="rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4"
              style={{ background: "#FDF6F8", border: "1px solid #F4A7B9" }}>
              <div className="flex-1">
                <p className="font-semibold text-pink-700">Your next annual check-up</p>
                <p className="text-sm text-pink-400 mt-0.5">
                  Your doctor recommends booking your next appointment in 12 months.
                </p>
              </div>
              <button
                onClick={() => navigate("/scheduling")}
                className="no-print btn-primary text-sm shrink-0"
              >
                Book now →
              </button>
            </div>
          )}

          {/* ── Reassuring footer ── */}
          <div className="rounded-xl border border-gray-100 bg-white px-5 py-4 text-center">
            <p className="text-sm text-gray-500">
              If you have any concerns before your next appointment, contact your clinic.
            </p>
            <p className="text-xs text-gray-400 mt-1">
              This summary is for your personal reference only and does not replace medical advice.
            </p>
          </div>

          {/* ── Back link ── */}
          <div className="no-print text-center pb-4">
            <button onClick={() => navigate("/appointment")} className="text-sm text-gray-400 hover:text-gray-600 transition">
              ← Back to my appointment
            </button>
          </div>

        </div>
      </Shell>
    </>
  );
}
