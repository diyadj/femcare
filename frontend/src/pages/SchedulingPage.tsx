import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Shell from "../components/Shell";
import { generateSlots, Slot } from "../mockSlots";
import { saveBooking, getBooking } from "../bookingStore";
import { format, formatDisplay, formatFull, groupBy, addDays, startOfWeek } from "../dateUtils";

const ALL_SLOTS = generateSlots();

type VisitReason = "routine" | "symptoms" | "urgent" | "followup";

const REASONS: { id: VisitReason; label: string; description: string; emoji: string }[] = [
  { id: "routine",  label: "Routine check-up",   description: "Annual gynaecological appointment", emoji: "🗓️" },
  { id: "symptoms", label: "Specific symptoms",   description: "Something specific you'd like checked", emoji: "🔍" },
  { id: "urgent",   label: "Urgent concern",      description: "Something that needs prompt attention", emoji: "🚨" },
  { id: "followup", label: "Follow-up",           description: "Returning after a previous appointment", emoji: "↩️" },
];

export default function SchedulingPage() {
  const navigate = useNavigate();
  const existingBooking = getBooking();

  // Step 1: reason selection. Step 2: calendar.
  const [reason, setReason] = useState<VisitReason | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  // Derive filter from reason
  const filterType = reason === "urgent" ? "urgent" : "all";

  // ── Week navigation ───────────────────────────────────────────────────────
  const weekStart = useMemo(() => startOfWeek(addDays(new Date(), weekOffset * 7)), [weekOffset]);
  const weekDays  = useMemo(() => Array.from({ length: 5 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  // ── Slots for this week ───────────────────────────────────────────────────
  const slotsByDay = useMemo(() => {
    const weekSlots = ALL_SLOTS
      .filter((s) => weekDays.some((wd) => format(wd) === format(s.date)))
      .filter((s) => filterType === "all" || s.type === filterType);
    return groupBy(weekSlots, (s) => format(s.date));
  }, [weekDays, filterType]);

  // ── Waiting list check: are all slots in next 2 weeks unavailable? ────────
  const next2WeeksSlots = useMemo(() => {
    const cutoff = addDays(new Date(), 14);
    return ALL_SLOTS.filter((s) => s.date <= cutoff && (filterType === "all" || s.type === filterType));
  }, [filterType]);
  const allUnavailable = next2WeeksSlots.length > 0 && next2WeeksSlots.every((s) => !s.available);
  const [joinedWaitlist, setJoinedWaitlist] = useState(false);

  // ── Confirm booking ───────────────────────────────────────────────────────
  const handleConfirm = () => {
    if (!selectedSlot) return;
    saveBooking({
      slotId: selectedSlot.id,
      date: selectedSlot.date,
      time: selectedSlot.time,
      type: selectedSlot.type,
      doctorName: selectedSlot.doctorName,
      bookedAt: new Date().toISOString(),
      intakeCompleted: false,
    });
    setConfirmed(true);
  };

  // ── Confirmed screen ──────────────────────────────────────────────────────
  if (confirmed && selectedSlot) {
    return (
      <Shell wide>
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-6 max-w-lg mx-auto">
          <div className="flex h-20 w-20 items-center justify-center rounded-full"
            style={{ background: "linear-gradient(135deg, #FAE8EE, #F4A7B9)" }}>
            <svg className="h-10 w-10 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold" style={{ color: "#2D2D2D" }}>Appointment booked</h2>
            <p className="text-gray-500 text-sm">{formatFull(selectedSlot.date)} at {selectedSlot.time}</p>
            <p className="text-gray-500 text-sm">{selectedSlot.doctorName}</p>
          </div>
          <div className="w-full rounded-xl px-6 py-4 text-sm space-y-2 text-left"
            style={{ background: "#FDF6F8", border: "1px solid #F4A7B9" }}>
            <p className="font-medium text-pink-700">Next steps</p>
            <ul className="space-y-1.5 text-pink-500">
              <li>✓ A confirmation has been saved to your account</li>
              <li>✓ Complete your pre-visit intake form before the appointment</li>
              <li>✓ You can reschedule any time from "My Appointment"</li>
            </ul>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <button onClick={() => navigate("/intake")} className="btn-primary flex-1">Complete intake form →</button>
            <button onClick={() => navigate("/appointment")} className="btn-secondary flex-1">View my appointment</button>
          </div>
        </div>
      </Shell>
    );
  }

  // ── Step 1: Reason selection ──────────────────────────────────────────────
  if (!reason) {
    return (
      <Shell wide>
        <div className="max-w-xl mx-auto space-y-6 py-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Book an appointment</h1>
            <p className="text-sm text-gray-500 mt-1">What is the reason for your visit?</p>
          </div>

          {existingBooking && (
            <div className="rounded-xl border border-sage-200 bg-sage-50 px-4 py-3 flex items-center justify-between gap-3">
              <p className="text-sm text-sage-700">
                You already have an appointment on <strong>{formatFull(existingBooking.date)}</strong>.
              </p>
              <button onClick={() => navigate("/appointment")} className="text-xs font-medium text-sage-700 underline underline-offset-2 shrink-0">
                View →
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {REASONS.map((r) => (
              <button key={r.id} onClick={() => setReason(r.id)}
                className="text-left rounded-2xl p-4 bg-white transition group hover:shadow-md"
                style={{ border: "1px solid #F7D0DC" }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = "#F4A7B9")}
                onMouseLeave={e => (e.currentTarget.style.borderColor = "#F7D0DC")}>
                <span className="text-2xl">{r.emoji}</span>
                <p className="mt-2 font-medium group-hover:text-pink-600 transition" style={{ color: "#2D2D2D" }}>{r.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{r.description}</p>
              </button>
            ))}
          </div>
        </div>
      </Shell>
    );
  }

  // ── Step 2: Calendar ──────────────────────────────────────────────────────
  return (
    <Shell wide>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => setReason(null)} className="text-gray-400 hover:text-gray-600 transition text-sm">
            ← Back
          </button>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Select a slot</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {REASONS.find((r) => r.id === reason)?.emoji}{" "}
              {REASONS.find((r) => r.id === reason)?.label}
            </p>
          </div>
        </div>

        {/* Urgent banner */}
        {reason === "urgent" && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 flex items-start gap-3">
            <span className="text-rose-500 text-lg mt-0.5">🚨</span>
            <div>
              <p className="text-sm font-semibold text-rose-800">We've prioritised urgent slots for you</p>
              <p className="text-sm text-rose-600 mt-0.5">
                These slots are reserved for patients who need prompt attention. If this is a medical emergency, please call 999.
              </p>
            </div>
          </div>
        )}

        {/* Waiting list banner */}
        {allUnavailable && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-amber-800">No slots available in the next 2 weeks</p>
              <p className="text-sm text-amber-600 mt-0.5">Join the waiting list and we'll notify you when a slot opens up.</p>
            </div>
            {joinedWaitlist ? (
              <span className="text-xs font-medium text-amber-700 bg-amber-100 px-3 py-1.5 rounded-full shrink-0">✓ On waiting list</span>
            ) : (
              <button onClick={() => setJoinedWaitlist(true)} className="btn-primary text-xs px-3 py-1.5 shrink-0">
                Join waiting list
              </button>
            )}
          </div>
        )}

        {/* Legend */}
        <div className="flex gap-4 text-xs text-gray-400">
          {filterType === "all" && (
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full inline-block" style={{ background: "#C4A8E0" }} /> Routine</span>
          )}
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-pink-500 inline-block" /> Urgent</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-gray-200 inline-block" /> Unavailable</span>
        </div>

        {/* Week navigation */}
        <div className="flex items-center gap-3">
          <button onClick={() => setWeekOffset((w) => Math.max(0, w - 1))} disabled={weekOffset === 0} className="btn-secondary px-3 py-1.5 text-sm disabled:opacity-40">← Prev</button>
          <span className="text-sm font-medium text-gray-700 flex-1 text-center">
            {formatDisplay(weekStart)} — {formatDisplay(addDays(weekStart, 4))}
          </span>
          <button onClick={() => setWeekOffset((w) => Math.min(3, w + 1))} disabled={weekOffset === 3} className="btn-secondary px-3 py-1.5 text-sm disabled:opacity-40">Next →</button>
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-5 gap-3">
          {weekDays.map((day) => {
            const key = format(day);
            const daySlots = (slotsByDay[key] || []).sort((a, b) => a.time.localeCompare(b.time));
            return (
              <div key={key} className="space-y-2">
                <div className="text-center">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {day.toLocaleDateString("en-GB", { weekday: "short" })}
                  </p>
                  <p className="text-lg font-semibold text-gray-900">{day.getDate()}</p>
                  <p className="text-xs text-gray-400">{day.toLocaleDateString("en-GB", { month: "short" })}</p>
                </div>
                <div className="space-y-1.5">
                  {daySlots.length === 0 && <p className="text-xs text-gray-300 text-center py-4">No slots</p>}
                  {daySlots.map((slot) => {
                    const isSelected = selectedSlot?.id === slot.id;
                    const isUrgent = slot.type === "urgent";
                    if (!slot.available) {
                      return (
                        <div key={slot.id} className="rounded-lg px-2 py-1.5 text-center text-xs text-gray-300 bg-gray-50 border border-gray-100 line-through">
                          {slot.time}
                        </div>
                      );
                    }
                    return (
                      <button
                        key={slot.id}
                        onClick={() => setSelectedSlot(isSelected ? null : slot)}
                        className={`w-full rounded-xl px-2 py-1.5 text-center text-xs font-medium transition border ${
                          isSelected
                            ? isUrgent ? "text-white border-transparent" : "text-white border-transparent"
                            : isUrgent ? "border-pink-200 text-pink-700 hover:bg-pink-50" : "bg-white border-lavender-200 text-lavender-700 hover:bg-lavender-50"
                        }`}
                        style={isSelected
                          ? { background: isUrgent ? "#E85C7A" : "linear-gradient(135deg, #F4A7B9, #E8728A)" }
                          : isUrgent ? { background: "#FDF6F8" } : { background: "#F5F0FB", borderColor: "#DACCF0", color: "#7D5AA8" }}
                      >
                        {slot.time}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Booking confirmation panel */}
        {selectedSlot && (
          <div className="rounded-2xl border border-sage-200 bg-white p-5 flex flex-col sm:flex-row sm:items-center gap-4 shadow-sm">
            <div className="flex-1 space-y-0.5">
              <p className="font-semibold text-gray-900">{formatFull(selectedSlot.date)} at {selectedSlot.time}</p>
              <p className="text-sm text-gray-500">{selectedSlot.doctorName}</p>
              <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full mt-1 ${
                selectedSlot.type === "urgent" ? "bg-pink-50 text-pink-700" : "text-lavender-700"
              }`} style={selectedSlot.type !== "urgent" ? { background: "#F5F0FB", color: "#7D5AA8" } : {}}>
                {selectedSlot.type === "urgent" ? "🔴 Urgent slot" : "🟣 Routine slot"}
              </span>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setSelectedSlot(null)} className="btn-secondary text-sm">Cancel</button>
              <button onClick={handleConfirm} className="btn-primary text-sm">Confirm booking →</button>
            </div>
          </div>
        )}
      </div>
    </Shell>
  );
}
