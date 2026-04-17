import React from "react";
import { useNavigate } from "react-router-dom";

interface Props { intakeId: string; message: string; }

export default function ConfirmationScreen({ intakeId, message }: Props) {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center space-y-6">
      <div className="flex h-20 w-20 items-center justify-center rounded-full"
        style={{ background: "linear-gradient(135deg, #FAE8EE, #F4A7B9)" }}>
        <svg className="h-10 w-10 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-semibold" style={{ color: "#2D2D2D" }}>You're all set</h2>
        <p className="text-gray-400 max-w-md">{message}</p>
      </div>

      <div className="rounded-2xl px-6 py-4 text-sm space-y-1 w-full max-w-sm text-left"
        style={{ background: "#FDF6F8", border: "1px solid #F4A7B9" }}>
        <p className="font-medium text-pink-700">What happens next?</p>
        <ul className="space-y-1 mt-2 text-pink-500">
          <li>✓ Your responses are encrypted and stored securely</li>
          <li>✓ Your doctor will review a summary before your appointment</li>
          <li>✓ You'll receive a plain-language summary after your visit</li>
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
        <button onClick={() => navigate("/scheduling")} className="btn-primary flex-1">Book an appointment →</button>
        <button onClick={() => navigate("/appointment")} className="btn-secondary flex-1">My appointment</button>
      </div>

      <p className="text-xs text-gray-300">Reference: {intakeId}</p>
    </div>
  );
}
