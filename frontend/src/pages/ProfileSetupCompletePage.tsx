import React from "react";
import { useNavigate } from "react-router-dom";
import Shell from "../components/Shell";
import { getProfile } from "../profileStore";

export default function ProfileSetupCompletePage() {
  const navigate = useNavigate();
  const profile  = getProfile();
  const firstName = profile?.basicInfo.name.split(" ")[0] || "there";

  return (
    <Shell>
      <div className="flex flex-col items-center justify-center py-16 text-center space-y-6 max-w-md mx-auto">
        <div className="h-20 w-20 rounded-full flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #FAE8EE, #F4A7B9)" }}>
          <svg className="h-10 w-10 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-semibold" style={{ color: "#2D2D2D" }}>
            Your profile is saved ✓
          </h2>
          <p className="text-gray-400">
            Welcome, {firstName}! Your health profile is set up and ready. Future intake forms will take under 2 minutes.
          </p>
        </div>

        <div className="rounded-2xl px-6 py-4 text-sm space-y-2 w-full text-left"
          style={{ background: "#FDF6F8", border: "1px solid #F4A7B9" }}>
          <p className="font-medium text-pink-700">What's next?</p>
          <ul className="space-y-1.5 text-pink-500 mt-2">
            <li>✓ Book your first appointment</li>
            <li>✓ Complete your pre-visit intake form</li>
            <li>✓ Your doctor will have a summary ready before you arrive</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <button onClick={() => navigate("/scheduling")} className="btn-primary flex-1">
            Book an appointment →
          </button>
          <button onClick={() => navigate("/intake")} className="btn-secondary flex-1">
            Complete intake form
          </button>
        </div>

        <button onClick={() => navigate("/profile")} className="text-xs text-gray-300 hover:text-pink-400 transition underline underline-offset-2">
          View my profile
        </button>
      </div>
    </Shell>
  );
}
