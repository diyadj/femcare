import { ReproductiveHistory, FamilyHistory, LifestyleFactors, Medication } from "./types";

export interface BasicInfo {
  name: string;
  dob: string;        // ISO date YYYY-MM-DD
  language: string;
}

export interface VisitRecord {
  date: string;       // ISO date
  doctorName: string;
  outcome: string;
}

export interface PatientProfile {
  basicInfo: BasicInfo;
  reproductive_history: ReproductiveHistory;
  family_history: FamilyHistory;
  lifestyle: LifestyleFactors;
  medications: Medication[];
  timeline: VisitRecord[];
  savedAt: string;
  reproUpdatedAt: string;
  lifestyleUpdatedAt: string;
  medicationsUpdatedAt: string;
}

const KEY = "femcare_patient_profile";

export function getProfile(): PatientProfile | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as PatientProfile) : null;
  } catch {
    return null;
  }
}

export function saveProfile(profile: Omit<PatientProfile, "savedAt">): void {
  localStorage.setItem(KEY, JSON.stringify({ ...profile, savedAt: new Date().toISOString() }));
}

export function updateProfileSection(
  patch: Partial<Omit<PatientProfile, "savedAt">>
): void {
  const existing = getProfile();
  if (!existing) return;
  const now = new Date().toISOString();
  localStorage.setItem(KEY, JSON.stringify({
    ...existing,
    ...patch,
    savedAt: now,
    reproUpdatedAt:       patch.reproductive_history ? now : existing.reproUpdatedAt,
    lifestyleUpdatedAt:   patch.lifestyle            ? now : existing.lifestyleUpdatedAt,
    medicationsUpdatedAt: patch.medications          ? now : existing.medicationsUpdatedAt,
  }));
}

export function clearProfile(): void {
  localStorage.removeItem(KEY);
}

// Mock past visits for the health timeline
export const MOCK_TIMELINE: VisitRecord[] = [
  { date: "2025-04-10", doctorName: "Dr. Sarah O'Brien",  outcome: "Routine check-up — all clear. Smear test normal." },
  { date: "2024-04-18", doctorName: "Dr. Aoife Murphy",   outcome: "Discussed contraception change. Switched to IUD." },
  { date: "2023-05-02", doctorName: "Dr. Claire Walsh",   outcome: "Follow-up on iron levels. Prescribed supplements." },
];
