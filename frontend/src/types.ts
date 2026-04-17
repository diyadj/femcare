export interface Symptom {
  name: string;
  duration_days: number | null;
  severity: "mild" | "moderate" | "severe" | null;
  notes: string;
}

export interface MenstrualCycle {
  cycle_length_days: number | null;
  period_duration_days: number | null;
  last_period_date: string;
  irregular: boolean;
  pain_level: number | null;
}

export interface ReproductiveHistory {
  pregnancies: number;
  live_births: number;
  miscarriages: number;
  current_contraception: string;
  menstrual_cycle: MenstrualCycle;
  last_smear_date: string;
  notes: string;
}

export interface FamilyHistory {
  ovarian_cancer: boolean;
  breast_cancer: boolean;
  endometriosis: boolean;
  pcos: boolean;
  other: string;
}

export interface LifestyleFactors {
  smoking: "never" | "former" | "current";
  alcohol_units_per_week: number | null;
  exercise_days_per_week: number | null;
  stress_level: number | null;
}

export interface Medication {
  name: string;
  dose: string;
  frequency: string;
}

export interface IntakeFormData {
  patient_id: string;
  appointment_id: string;
  symptoms: Symptom[];
  reproductive_history: ReproductiveHistory;
  family_history: FamilyHistory;
  lifestyle: LifestyleFactors;
  medications: Medication[];
  patient_questions: string;
  consent_given_at: string | null;
  data_version: string;
}

export type SectionId =
  | "consent"
  | "symptoms"
  | "reproductive"
  | "family"
  | "lifestyle"
  | "medications"
  | "questions"
  | "confirmation";
