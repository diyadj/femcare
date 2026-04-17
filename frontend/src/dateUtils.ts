/** Lightweight date helpers — no date-fns dependency needed. */

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function format(date: Date): string {
  // Returns YYYY-MM-DD
  return date.toISOString().slice(0, 10);
}

export function formatDisplay(date: Date): string {
  // e.g. "Mon 21 Apr"
  return date.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

export function formatFull(date: Date): string {
  // e.g. "Monday, 21 April 2026"
  return date.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

export function isSameDay(a: Date, b: Date): boolean {
  return format(a) === format(b);
}

export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

export function isTomorrow(date: Date): boolean {
  const tomorrow = addDays(new Date(), 1);
  return isSameDay(date, tomorrow);
}

/** Group an array of items by a string key. */
export function groupBy<T>(items: T[], key: (item: T) => string): Record<string, T[]> {
  return items.reduce((acc, item) => {
    const k = key(item);
    (acc[k] = acc[k] || []).push(item);
    return acc;
  }, {} as Record<string, T[]>);
}

/** Get the Monday of the week containing `date`. */
export function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day; // adjust so Monday = start
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}
