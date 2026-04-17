import { Booking } from "./mockSlots";

const KEY = "femcare_booking";

export function getBooking(): Booking | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const b = JSON.parse(raw) as Booking;
    b.date = new Date(b.date);
    return b;
  } catch {
    return null;
  }
}

export function saveBooking(booking: Booking): void {
  localStorage.setItem(KEY, JSON.stringify(booking));
}

export function markIntakeCompleted(): void {
  const b = getBooking();
  if (b) saveBooking({ ...b, intakeCompleted: true });
}

export function clearBooking(): void {
  localStorage.removeItem(KEY);
}
