import React from "react";
import { PatientProfile } from "../profileStore";

interface Props {
  profile: PatientProfile;
  onReview: () => void;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function ProfileCard({ profile, onReview }: Props) {
  const medCount = profile.medications.length;

  return (
    <div
      className="rounded-2xl px-5 py-4 flex items-start justify-between gap-4"
      style={{ background: "#FDF6F8", border: "1.5px solid #F4A7B9" }}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className="h-10 w-10 rounded-full flex items-center justify-center shrink-0 mt-0.5"
          style={{ background: "linear-gradient(135deg, #FAE8EE, #F4A7B9)" }}
        >
          <svg className="h-5 w-5 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-pink-700">Your profile is up to date ✓</p>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Last updated: {formatDate(profile.savedAt)}
          </p>
          <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
            {profile.reproductive_history.current_contraception && (
              <span className="flex items-center gap-1">
                <span className="text-pink-300">•</span>
                {profile.reproductive_history.current_contraception}
              </span>
            )}
            {medCount > 0 && (
              <span className="flex items-center gap-1">
                <span className="text-pink-300">•</span>
                {medCount} medication{medCount !== 1 ? "s" : ""}
              </span>
            )}
            {profile.lifestyle.smoking !== "never" && (
              <span className="flex items-center gap-1">
                <span className="text-pink-300">•</span>
                {profile.lifestyle.smoking} smoker
              </span>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={onReview}
        className="text-xs font-medium text-pink-500 hover:text-pink-700 underline underline-offset-2 transition shrink-0 mt-1"
      >
        Review & update
      </button>
    </div>
  );
}
