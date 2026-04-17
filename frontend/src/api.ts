import { IntakeFormData } from "./types";

const API_BASE = "/api/v1/intake";

export async function startIntake(
  patientId: string,
  appointmentId: string
): Promise<{ intake_id: string; message: string }> {
  const response = await fetch(`${API_BASE}/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      patient_id: patientId,
      appointment_id: appointmentId,
      consent_given: true,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to start intake");
  }

  return response.json();
}

export async function saveProgress(
  intakeId: string,
  formData: IntakeFormData
): Promise<void> {
  const response = await fetch(`${API_BASE}/${intakeId}/save`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });

  if (!response.ok) {
    throw new Error("Failed to save progress");
  }
}

export async function submitIntake(
  intakeId: string,
  formData: IntakeFormData
): Promise<{ intake_id: string; status: string; message: string }> {
  const response = await fetch(`${API_BASE}/${intakeId}/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });

  if (!response.ok) {
    throw new Error("Failed to submit intake");
  }

  return response.json();
}
