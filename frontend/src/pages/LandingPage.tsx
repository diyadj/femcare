import React from "react";
import { useNavigate } from "react-router-dom";
import { getProfile } from "../profileStore";

export default function LandingPage() {
  const navigate = useNavigate();
  const hasProfile = !!getProfile();

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(160deg, #FDF6F8 0%, #FAE8EE 100%)" }}>
      {/* Header */}
      <header className="px-6 py-4 flex items-center gap-2">
        <div className="h-8 w-8 rounded-full flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #F4A7B9, #E8728A)" }}>
          <span className="text-white text-sm font-bold">F</span>
        </div>
        <span className="font-semibold" style={{ color: "#2D2D2D" }}>FemCare</span>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center space-y-8 pb-16">
        {/* Icon */}
        <div className="relative">
          <div className="h-24 w-24 rounded-full flex items-center justify-center mx-auto"
            style={{ background: "linear-gradient(135deg, #F4A7B9, #E8728A)", boxShadow: "0 8px 32px rgba(232,114,138,0.3)" }}>
            <svg className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          </div>
          {/* Decorative dots */}
          <div className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-pink-200 opacity-60" />
          <div className="absolute -bottom-1 -left-3 h-3 w-3 rounded-full bg-lavender-300 opacity-50" />
        </div>

        <div className="space-y-3 max-w-sm">
          <h1 className="text-4xl font-semibold tracking-tight" style={{ color: "#2D2D2D" }}>
            Your health,<br />
            <span style={{ background: "linear-gradient(135deg, #E8728A, #C4A8E0)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              remembered.
            </span>
          </h1>
          <p className="text-gray-400 text-base leading-relaxed">
            FemCare helps you prepare for your gynaecologist appointment and keeps track of your health over time.
          </p>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-2 max-w-xs">
          {["Smart intake form", "Appointment booking", "Visit summaries", "Health timeline"].map((f) => (
            <span key={f} className="text-xs font-medium px-3 py-1.5 rounded-full"
              style={{ background: "white", color: "#E8728A", border: "1px solid #F4A7B9" }}>
              {f}
            </span>
          ))}
        </div>

        {/* CTA */}
        <div className="flex flex-col gap-3 w-full max-w-xs">
          {hasProfile ? (
            <>
              <button onClick={() => navigate("/scheduling")} className="btn-primary w-full text-base py-3">
                Book an appointment →
              </button>
              <button onClick={() => navigate("/intake")} className="btn-secondary w-full">
                Complete intake form
              </button>
            </>
          ) : (
            <>
              <button onClick={() => navigate("/setup")} className="btn-primary w-full text-base py-3">
                Get started →
              </button>
              <button onClick={() => navigate("/scheduling")}
                className="text-sm text-gray-400 hover:text-pink-500 transition underline underline-offset-2">
                Skip to booking
              </button>
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center pb-6 text-xs text-gray-300">
        Secure · Encrypted · GDPR compliant · Data stored in Ireland (EU)
      </footer>
    </div>
  );
}
