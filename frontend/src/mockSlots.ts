import { addDays, format } from "./dateUtils";

export type SlotType = "routine" | "urgent";

export interface Slot {
  id: string;
  date: Date;
  time: string; // "HH:MM"
  type: SlotType;
  available: boolean;
  doctorName: string;
}

export interface Booking {
  slotId: string;
  date: Date;
  time: string;
  type: SlotType;
  doctorName: string;
  bookedAt: string; // ISO
  intakeCompleted: boolean;
}

const DOCTORS = ["Dr. Sarah O'Brien", "Dr. Aoife Murphy", "Dr. Claire Walsh"];
const ROUTINE_TIMES = ["09:00", "09:30", "10:00", "10:30", "11:00", "14:00", "14:30", "15:00", "15:30", "16:00"];
const URGENT_TIMES  = ["08:30", "13:00", "16:30"];

/** Generate mock slots for the next 28 days (Mon–Fri only). */
export function generateSlots(): Slot[] {
  const slots: Slot[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let d = 1; d <= 28; d++) {
    const date = addDays(today, d);
    const dow = date.getDay(); // 0=Sun, 6=Sat
    if (dow === 0 || dow === 6) continue;

    const doctor = DOCTORS[d % DOCTORS.length];

    ROUTINE_TIMES.forEach((time, i) => {
      // Randomly mark ~20% as unavailable for realism
      const available = (d + i) % 5 !== 0;
      slots.push({
        id: `routine-${format(date)}-${time}`,
        date,
        time,
        type: "routine",
        available,
        doctorName: doctor,
      });
    });

    URGENT_TIMES.forEach((time) => {
      slots.push({
        id: `urgent-${format(date)}-${time}`,
        date,
        time,
        type: "urgent",
        available: true,
        doctorName: doctor,
      });
    });
  }

  return slots;
}
