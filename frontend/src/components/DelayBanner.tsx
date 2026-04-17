import React, { useState } from "react";

interface Props {
  delayMinutes: number;
  appointmentTime: string; // "HH:MM"
  onReschedule: () => void;
}

/** Parse "HH:MM" and add minutes, return new "HH:MM" string. */
function addMinutesToTime(time: string, minutes: number): string {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + minutes;
  const newH = Math.floor(total / 60) % 24;
  const newM = total % 60;
  return `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`;
}

export default function DelayBanner({ delayMinutes, appointmentTime, onReschedule }: Props) {
  const [notified, setNotified] = useState(false);
  const newTime = addMinutesToTime(appointmentTime, delayMinutes);
  const isLongDelay = delayMinutes >= 30;

  return (
    <div
      className="rounded-2xl px-5 py-4 space-y-3"
      style={{ background: "#FFFBEB", border: "1.5px solid #FCD34D" }}
    >
      {/* Header row */}
      <div className="flex items-start gap-3">
        <span className="text-2xl mt-0.5">🕐</span>
        <div className="flex-1">
          <p className="font-semibold text-amber-900 text-sm">
            Your doctor is running approximately {delayMinutes} minutes late
          </p>
          <p className="text-amber-700 text-sm mt-0.5">
            Your new estimated start time is{" "}
            <strong>{newTime}</strong>. No need to rush.
          </p>
        </div>
      </div>

      {/* Long delay message */}
      {isLongDelay && (
        <div
          className="rounded-xl px-4 py-3 text-sm text-amber-800"
          style={{ background: "#FEF3C7", border: "1px solid #FCD34D" }}
        >
          We're sorry for the wait. You can reschedule at no cost.
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2 pt-1">
        <button
          onClick={() => setNotified(true)}
          disabled={notified}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition"
          style={
            notified
              ? { background: "#D1FAE5", color: "#065F46", border: "1px solid #6EE7B7" }
              : { background: "#FCD34D", color: "#78350F", border: "none" }
          }
        >
          {notified ? "✓ We'll notify you when she's ready" : "🔔 Notify me when she's ready"}
        </button>

        {isLongDelay && (
          <button
            onClick={onReschedule}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition"
            style={{ background: "white", color: "#92400E", border: "1.5px solid #FCD34D" }}
          >
            ↺ Reschedule at no cost
          </button>
        )}
      </div>
    </div>
  );
}
