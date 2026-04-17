import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Shell from "../components/Shell";
import DelayBanner from "../components/DelayBanner";
import { getBooking, clearBooking } from "../bookingStore";
import { Booking } from "../mockSlots";
import { formatFull, isToday, isTomorrow } from "../dateUtils";

const MOCK_DELAY_MINUTES = 35;

export default function AppointmentPage() {
  const navigate = useNavigate();
  const [booking, setBooking]           = useState<Booking | null>(null);
  const [rescheduling, setRescheduling] = useState(false);
  const [simulateDelay, setSimulateDelay] = useState(false);

  useEffect(() => { setBooking(getBooking()); }, []);

  // ── No booking ────────────────────────────────────────────────────────────
  if (!booking) {
    return (
      <Shell>
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="h-16 w-16 rounded-full bg-pink-50 flex items-center justify-center"
            style={{ border: "1px solid #F4A7B9" }}>
            <svg className="h-8 w-8 text-pink-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold" style={{ color: "#2D2D2D" }}>No upcoming appointment</h2>
            <p className="text-sm text-gray-400 mt-1">Book a slot and it will appear here.</p>
          </div>
          <button onClick={() => navigate("/scheduling")} className="btn-primary">Book an appointment →</button>
        </div>
      </Shell>
    );
  }

  const appointmentIsToday    = isToday(booking.date);
  const appointmentIsTomorrow = isTomorrow(booking.date);
  const intakePending         = !booking.intakeCompleted;
  const showDelay             = appointmentIsToday || simulateDelay;

  // ── Reschedule screen ─────────────────────────────────────────────────────
  if (rescheduling) {
    return (
      <Shell>
        <div className="max-w-md mx-auto space-y-6 py-8">
          <div className="card space-y-4">
            <h2 className="text-lg font-semibold" style={{ color: "#2D2D2D" }}>Reschedule appointment</h2>
            <div className="rounded-xl px-4 py-3 text-sm"
              style={{ background: "#FDF6F8", border: "1px solid #F4A7B9" }}>
              <p className="font-medium text-pink-700">Current booking</p>
              <p className="mt-1 text-gray-600">{formatFull(booking.date)} at <strong>{booking.time}</strong></p>
              <p className="text-gray-400 text-xs mt-0.5">{booking.doctorName}</p>
            </div>
            <p className="text-sm text-gray-400">
              This slot will be released and you'll be taken back to the calendar to pick a new time.
            </p>
            <div className="flex gap-3 pt-1">
              <button onClick={() => setRescheduling(false)} className="btn-secondary flex-1">Keep current</button>
              <button onClick={() => { clearBooking(); navigate("/scheduling"); }} className="btn-primary flex-1">
                Pick new slot →
              </button>
            </div>
          </div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="space-y-4 max-w-lg mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold" style={{ color: "#2D2D2D" }}>My appointment</h1>
          {/* Demo toggle */}
          <button
            onClick={() => setSimulateDelay((v) => !v)}
            className="text-xs px-3 py-1.5 rounded-xl transition font-medium"
            style={simulateDelay
              ? { background: "#FCD34D", color: "#78350F", border: "1px solid #F59E0B" }
              : { background: "#F9F9F9", color: "#9CA3AF", border: "1px solid #E5E7EB" }}
          >
            {simulateDelay ? "⏱ Delay ON" : "⏱ Simulate delay"}
          </button>
        </div>

        {/* ── Doctor running late banner ── */}
        {showDelay && (
          <DelayBanner
            delayMinutes={MOCK_DELAY_MINUTES}
            appointmentTime={booking.time}
            onReschedule={() => setRescheduling(true)}
          />
        )}

        {/* ── Tomorrow reminder ── */}
        {appointmentIsTomorrow && (
          <div className="rounded-2xl px-4 py-3 flex items-start gap-3"
            style={{ background: "#FFFBEB", border: "1.5px solid #FCD34D" }}>
            <span className="text-amber-500 text-lg mt-0.5">⏰</span>
            <div>
              <p className="text-sm font-semibold text-amber-900">Your appointment is tomorrow</p>
              <p className="text-sm text-amber-700 mt-0.5">Complete your intake form so your doctor is prepared.</p>
              <button onClick={() => navigate("/intake")} className="mt-2 text-xs font-semibold text-amber-800 underline underline-offset-2">
                Complete intake form →
              </button>
            </div>
          </div>
        )}

        {/* ── Intake pending banner ── */}
        {intakePending && !appointmentIsToday && !appointmentIsTomorrow && (
          <div className="rounded-2xl px-4 py-3 flex items-center justify-between gap-3"
            style={{ background: "#FDF6F8", border: "1.5px solid #F4A7B9" }}>
            <div>
              <p className="text-sm font-semibold text-pink-700">
                Your appointment is on {formatFull(booking.date)}
              </p>
              <p className="text-sm text-pink-400 mt-0.5">Complete your intake form to help your doctor prepare.</p>
            </div>
            <button onClick={() => navigate("/intake")} className="btn-primary text-xs px-3 py-1.5 shrink-0">
              Start form →
            </button>
          </div>
        )}

        {/* ── Appointment card ── */}
        <div className="card space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-xs text-gray-400 uppercase tracking-wide">Upcoming appointment</p>
              <p className="font-semibold" style={{ color: "#2D2D2D" }}>{formatFull(booking.date)}</p>
              <p className="text-3xl font-bold text-pink-500">{booking.time}</p>
              <p className="text-sm text-gray-400">{booking.doctorName}</p>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full"
              style={booking.type === "urgent"
                ? { background: "#FDF6F8", color: "#E85C7A", border: "1px solid #F4A7B9" }
                : { background: "#F5F0FB", color: "#7D5AA8", border: "1px solid #DACCF0" }}>
              {booking.type === "urgent" ? "🔴 Urgent" : "🟣 Routine"}
            </span>
          </div>

          {/* Intake status pill */}
          <div className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium"
            style={intakePending
              ? { background: "#F9F9F9", color: "#9CA3AF" }
              : { background: "#FDF6F8", color: "#E8728A", border: "1px solid #F4A7B9" }}>
            <span>{intakePending ? "○" : "✓"}</span>
            <span>{intakePending ? "Intake form not yet completed" : "Intake form completed"}</span>
          </div>

          <div className="border-t pt-3 text-xs text-gray-300" style={{ borderColor: "#F7D0DC" }}>
            Booked {new Date(booking.bookedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
          </div>

          <div className="flex gap-3">
            <button onClick={() => setRescheduling(true)} className="btn-secondary flex-1 text-sm">↺ Reschedule</button>
            <button onClick={() => navigate("/intake")} className="btn-primary flex-1 text-sm">Complete intake form →</button>
          </div>

          <button onClick={() => { clearBooking(); setBooking(null); }}
            className="w-full text-xs text-gray-300 hover:text-pink-500 transition text-center">
            Cancel appointment
          </button>
        </div>

        {/* ── Post-visit summary ── */}
        {!appointmentIsToday && booking.date < new Date() && (
          <div className="rounded-2xl bg-white p-4 flex items-center gap-4"
            style={{ border: "1px solid #F7D0DC" }}>
            <div className="h-10 w-10 rounded-full flex items-center justify-center shrink-0"
              style={{ background: "#FDF6F8" }}>
              <span className="text-lg">📋</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium" style={{ color: "#2D2D2D" }}>Your visit summary is ready</p>
              <p className="text-xs text-gray-400">See what was discussed and your next steps.</p>
            </div>
            <button onClick={() => navigate("/visit-summary")} className="btn-primary text-xs px-3 py-1.5">View →</button>
          </div>
        )}
      </div>
    </Shell>
  );
}
