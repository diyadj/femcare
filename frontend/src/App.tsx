import { FormEvent, useMemo, useState } from 'react';

type IntakeStatus = 'idle' | 'started' | 'saved' | 'submitted' | 'error';

type IntakeFormState = {
  patientId: string;
  appointmentId: string;
  consentGiven: boolean;
  symptomName: string;
  symptomDurationDays: string;
  symptomSeverity: 'mild' | 'moderate' | 'severe';
  symptomNotes: string;
  patientQuestions: string;
  contraception: string;
  lastSmearDate: string;
  menstrualCycleNotes: string;
  smoking: 'never' | 'former' | 'current';
};

const featureCards = [
  {
    title: 'Pre-visit intake',
    description:
      'Structured symptom capture, consent-first onboarding, and automated brief generation before the appointment begins.',
  },
  {
    title: 'In-consultation support',
    description:
      'A clinician-facing checklist keeps the visit focused on screening, contraception, symptoms, and patient priorities.',
  },
  {
    title: 'Post-visit continuity',
    description:
      'Clear summaries and follow-up actions carry the conversation forward so next year does not start from zero.',
  },
];

const workflow = [
  {
    step: '01',
    title: 'Patient prepares',
    description: 'The patient captures symptoms, menstrual context, and questions in a calm guided flow.',
  },
  {
    step: '02',
    title: 'AI triages',
    description: 'The backend returns a safe, clinician-readable brief with red flags and screening prompts.',
  },
  {
    step: '03',
    title: 'Care continues',
    description: 'The visit ends with plain-language next steps and a durable record for future care.',
  },
];

const statCards: Array<{ label: string; value: string; tone: 'accent' | 'secondary' | 'important' }> = [
  { label: 'Structured intake', value: '12 fields', tone: 'accent' },
  { label: 'Visit focus', value: '3 phases', tone: 'secondary' },
  { label: 'Safety posture', value: 'Advisory only', tone: 'important' },
];

const initialForm: IntakeFormState = {
  patientId: 'patient-1024',
  appointmentId: 'appt-2026-04-17',
  consentGiven: true,
  symptomName: 'Pelvic discomfort',
  symptomDurationDays: '14',
  symptomSeverity: 'moderate',
  symptomNotes: 'Worse during the second half of the cycle and after exercise.',
  patientQuestions: 'Could this be endometriosis, and what screening should I ask about?',
  contraception: 'Combined pill',
  lastSmearDate: '2024-11-12',
  menstrualCycleNotes: 'Cycle length 29 days, occasional spotting, mild cramps.',
  smoking: 'never',
};

const apiBase = import.meta.env.VITE_API_BASE_URL ?? '';

function buildPayload(form: IntakeFormState) {
  return {
    patient_id: form.patientId,
    appointment_id: form.appointmentId,
    submitted_at: new Date().toISOString(),
    symptoms: form.symptomName
      ? [
          {
            name: form.symptomName,
            duration_days: Number(form.symptomDurationDays) || null,
            severity: form.symptomSeverity,
            notes: form.symptomNotes || null,
          },
        ]
      : [],
    reproductive_history: {
      current_contraception: form.contraception || null,
      last_smear_date: form.lastSmearDate || null,
      menstrual_cycle: form.menstrualCycleNotes
        ? {
            notes: form.menstrualCycleNotes,
          }
        : undefined,
    },
    lifestyle: {
      smoking: form.smoking,
    },
    patient_questions: form.patientQuestions,
    consent_given_at: form.consentGiven ? new Date().toISOString() : null,
  };
}

function toneClasses(tone: 'accent' | 'secondary' | 'important') {
  if (tone === 'secondary') {
    return 'bg-secondary/10 text-secondary ring-1 ring-secondary/15';
  }

  if (tone === 'important') {
    return 'bg-important/10 text-important ring-1 ring-important/15';
  }

  return 'bg-accent/10 text-accent ring-1 ring-accent/15';
}

export default function App() {
  const [form, setForm] = useState<IntakeFormState>(initialForm);
  const [intakeId, setIntakeId] = useState<string>('');
  const [status, setStatus] = useState<IntakeStatus>('idle');
  const [message, setMessage] = useState<string>(
    'Start a consented intake session to see the live workflow.',
  );
  const [busyAction, setBusyAction] = useState<'start' | 'save' | 'submit' | null>(null);

  const payload = useMemo(() => buildPayload(form), [form]);

  async function requestJson(url: string, options: RequestInit) {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers ?? {}),
      },
      ...options,
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : null;

    if (!response.ok) {
      throw new Error(data?.detail ?? data?.message ?? 'Request failed');
    }

    return data;
  }

  function updateForm<K extends keyof IntakeFormState>(key: K, value: IntakeFormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleStart(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusyAction('start');
    setStatus('idle');

    try {
      const result = await requestJson(`${apiBase}/api/v1/intake/start`, {
        method: 'POST',
        body: JSON.stringify({
          patient_id: form.patientId,
          appointment_id: form.appointmentId,
          consent_given: form.consentGiven,
        }),
      });

      setIntakeId(result.intake_id);
      setStatus('started');
      setMessage(result.message);
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Unable to start intake.');
    } finally {
      setBusyAction(null);
    }
  }

  async function handleSave() {
    if (!intakeId) {
      setStatus('error');
      setMessage('Start the intake first to create a session.');
      return;
    }

    setBusyAction('save');

    try {
      const result = await requestJson(`${apiBase}/api/v1/intake/${intakeId}/save`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      setStatus('saved');
      setMessage(`Progress saved. Session ${result.intake_id} is ready to resume.`);
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Unable to save progress.');
    } finally {
      setBusyAction(null);
    }
  }

  async function handleSubmit() {
    if (!intakeId) {
      setStatus('error');
      setMessage('Start the intake first to create a session.');
      return;
    }

    setBusyAction('submit');

    try {
      const result = await requestJson(`${apiBase}/api/v1/intake/${intakeId}/submit`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      setStatus('submitted');
      setMessage(result.message);
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Unable to submit intake.');
    } finally {
      setBusyAction(null);
    }
  }

  const statusLabel =
    status === 'started'
      ? 'Session created'
      : status === 'saved'
        ? 'Progress saved'
        : status === 'submitted'
          ? 'Ready for triage'
          : status === 'error'
            ? 'Needs attention'
            : 'Awaiting action';

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-bg-secondary via-bg-primary to-bg-tertiary text-typography">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="orb orb-one" />
        <div className="orb orb-two" />
        <div className="orb orb-three" />
      </div>

      <main className="relative mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <header className="flex flex-col gap-5 rounded-[2rem] border border-white/60 bg-white/75 p-5 shadow-[0_24px_80px_rgba(255,90,125,0.08)] backdrop-blur-xl sm:p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-sm font-semibold text-accent ring-1 ring-accent/15">
              <span className="h-2 w-2 rounded-full bg-accent" />
              FemCare
            </div>
            <div>
              <h1 className="font-display text-3xl font-semibold tracking-tight text-typography sm:text-4xl">
                A calmer gynaecology experience, powered by structured AI support.
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-typography-light sm:text-base">
                FemCare helps patients prepare, gives clinicians a focused brief, and preserves
                continuity after the appointment. The interface below mirrors the pre-visit
                intake flow exposed by the backend.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:w-[28rem]">
            {statCards.map((stat) => (
              <div key={stat.label} className={`rounded-2xl px-4 py-3 ${toneClasses(stat.tone)}`}>
                <div className="text-xs font-semibold uppercase tracking-[0.24em] opacity-70">
                  {stat.label}
                </div>
                <div className="mt-2 text-lg font-semibold">{stat.value}</div>
              </div>
            ))}
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          {featureCards.map((card, index) => (
            <article
              key={card.title}
              className="card relative overflow-hidden border-white/70 bg-white/80 p-6 shadow-[0_18px_60px_rgba(33,37,41,0.06)]"
            >
              <div className="mb-4 inline-flex rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-secondary">
                {String(index + 1).padStart(2, '0')}
              </div>
              <h2 className="font-display text-2xl font-semibold text-typography">{card.title}</h2>
              <p className="mt-3 text-sm leading-6 text-typography-light">{card.description}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.35fr_0.95fr]">
          <article className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_18px_60px_rgba(33,37,41,0.07)] backdrop-blur-xl sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
                  Intake workspace
                </div>
                <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-typography">
                  Capture the story once, then reuse it everywhere.
                </h2>
              </div>

              <div className="rounded-2xl bg-bg-secondary px-4 py-3 text-sm text-typography-light ring-1 ring-accent/10">
                <div className="font-semibold text-typography">Status</div>
                <div>{statusLabel}</div>
              </div>
            </div>

            <form className="mt-8 grid gap-6 xl:grid-cols-[1fr_0.92fr]" onSubmit={handleStart}>
              <div className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2 text-sm font-medium text-typography-light">
                    <span>Patient ID</span>
                    <input
                      className="input-field"
                      value={form.patientId}
                      onChange={(event) => updateForm('patientId', event.target.value)}
                    />
                  </label>
                  <label className="space-y-2 text-sm font-medium text-typography-light">
                    <span>Appointment ID</span>
                    <input
                      className="input-field"
                      value={form.appointmentId}
                      onChange={(event) => updateForm('appointmentId', event.target.value)}
                    />
                  </label>
                </div>

                <label className="flex items-start gap-3 rounded-2xl border border-accent/15 bg-accent/5 p-4 text-sm text-typography">
                  <input
                    className="mt-1 h-4 w-4 rounded border-neutral text-accent focus:ring-accent"
                    type="checkbox"
                    checked={form.consentGiven}
                    onChange={(event) => updateForm('consentGiven', event.target.checked)}
                  />
                  <span>
                    Consent is required before any intake data is captured or shared with the
                    clinician.
                  </span>
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2 text-sm font-medium text-typography-light">
                    <span>Main symptom</span>
                    <input
                      className="input-field"
                      value={form.symptomName}
                      onChange={(event) => updateForm('symptomName', event.target.value)}
                    />
                  </label>
                  <label className="space-y-2 text-sm font-medium text-typography-light">
                    <span>Duration in days</span>
                    <input
                      className="input-field"
                      inputMode="numeric"
                      value={form.symptomDurationDays}
                      onChange={(event) => updateForm('symptomDurationDays', event.target.value)}
                    />
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2 text-sm font-medium text-typography-light">
                    <span>Severity</span>
                    <select
                      className="input-field"
                      value={form.symptomSeverity}
                      onChange={(event) =>
                        updateForm('symptomSeverity', event.target.value as IntakeFormState['symptomSeverity'])
                      }
                    >
                      <option value="mild">Mild</option>
                      <option value="moderate">Moderate</option>
                      <option value="severe">Severe</option>
                    </select>
                  </label>
                  <label className="space-y-2 text-sm font-medium text-typography-light">
                    <span>Smoking</span>
                    <select
                      className="input-field"
                      value={form.smoking}
                      onChange={(event) =>
                        updateForm('smoking', event.target.value as IntakeFormState['smoking'])
                      }
                    >
                      <option value="never">Never</option>
                      <option value="former">Former</option>
                      <option value="current">Current</option>
                    </select>
                  </label>
                </div>

                <label className="space-y-2 text-sm font-medium text-typography-light">
                  <span>Symptom notes</span>
                  <textarea
                    className="input-field min-h-28 resize-none"
                    value={form.symptomNotes}
                    onChange={(event) => updateForm('symptomNotes', event.target.value)}
                  />
                </label>

                <label className="space-y-2 text-sm font-medium text-typography-light">
                  <span>Questions for the clinician</span>
                  <textarea
                    className="input-field min-h-28 resize-none"
                    value={form.patientQuestions}
                    onChange={(event) => updateForm('patientQuestions', event.target.value)}
                  />
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2 text-sm font-medium text-typography-light">
                    <span>Current contraception</span>
                    <input
                      className="input-field"
                      value={form.contraception}
                      onChange={(event) => updateForm('contraception', event.target.value)}
                    />
                  </label>
                  <label className="space-y-2 text-sm font-medium text-typography-light">
                    <span>Last smear date</span>
                    <input
                      className="input-field"
                      type="date"
                      value={form.lastSmearDate}
                      onChange={(event) => updateForm('lastSmearDate', event.target.value)}
                    />
                  </label>
                </div>

                <label className="space-y-2 text-sm font-medium text-typography-light">
                  <span>Cycle context</span>
                  <textarea
                    className="input-field min-h-24 resize-none"
                    value={form.menstrualCycleNotes}
                    onChange={(event) => updateForm('menstrualCycleNotes', event.target.value)}
                  />
                </label>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button className="btn-primary" type="submit" disabled={busyAction !== null}>
                    {busyAction === 'start' ? 'Starting...' : 'Start intake'}
                  </button>
                  <button type="button" className="btn-outline" onClick={handleSave} disabled={busyAction !== null}>
                    {busyAction === 'save' ? 'Saving...' : 'Save progress'}
                  </button>
                  <button type="button" className="btn-secondary" onClick={handleSubmit} disabled={busyAction !== null}>
                    {busyAction === 'submit' ? 'Submitting...' : 'Submit intake'}
                  </button>
                </div>
              </div>

              <aside className="rounded-[1.75rem] border border-bg-tertiary bg-gradient-to-b from-bg-neutral to-white p-5 shadow-inner sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.28em] text-secondary">
                      Live preview
                    </div>
                    <h3 className="mt-2 font-display text-2xl font-semibold text-typography">
                      What the clinician sees
                    </h3>
                  </div>
                  <div className="rounded-full bg-typography px-3 py-1 text-xs font-semibold text-white">
                    {intakeId ? 'Active' : 'Draft'}
                  </div>
                </div>

                <div className="mt-5 space-y-4">
                  <div className="rounded-2xl bg-white p-4 ring-1 ring-black/5">
                    <div className="text-xs font-semibold uppercase tracking-[0.24em] text-typography-lighter">
                      Intake ID
                    </div>
                    <div className="mt-2 font-semibold text-typography">{intakeId || 'Not started yet'}</div>
                  </div>

                  <div className="rounded-2xl bg-white p-4 ring-1 ring-black/5">
                    <div className="text-xs font-semibold uppercase tracking-[0.24em] text-typography-lighter">
                      Message
                    </div>
                    <p className="mt-2 text-sm leading-6 text-typography">{message}</p>
                  </div>

                  <div className="rounded-2xl bg-white p-4 ring-1 ring-black/5">
                    <div className="text-xs font-semibold uppercase tracking-[0.24em] text-typography-lighter">
                      Payload preview
                    </div>
                    <pre className="mt-3 overflow-x-auto rounded-xl bg-bg-neutral p-4 text-xs leading-6 text-typography-light">
{JSON.stringify(payload, null, 2)}
                    </pre>
                  </div>
                </div>
              </aside>
            </form>
          </article>

          <div className="space-y-6">
            <article className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_18px_60px_rgba(33,37,41,0.07)] backdrop-blur-xl">
              <div className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
                Patient journey
              </div>
              <h3 className="mt-2 font-display text-3xl font-semibold text-typography">
                One intake, three moments of care.
              </h3>

              <div className="mt-6 space-y-4">
                {workflow.map((item) => (
                  <div key={item.step} className="flex gap-4 rounded-2xl bg-bg-neutral p-4 ring-1 ring-black/5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-sm font-bold text-white shadow-lg shadow-accent/20">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="font-semibold text-typography">{item.title}</h4>
                      <p className="mt-1 text-sm leading-6 text-typography-light">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-[2rem] border border-accent/15 bg-gradient-to-br from-accent/10 to-white p-6 shadow-[0_18px_60px_rgba(255,90,125,0.08)]">
              <div className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
                Safety note
              </div>
              <p className="mt-3 text-sm leading-6 text-typography">
                This product is intentionally advisory. The UI never suggests a diagnosis, and it
                should always route red flags to a clinician review path.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-typography-light">
                <li className="rounded-xl bg-white/70 px-3 py-2 ring-1 ring-black/5">Consent-first intake</li>
                <li className="rounded-xl bg-white/70 px-3 py-2 ring-1 ring-black/5">Audit-ready session state</li>
                <li className="rounded-xl bg-white/70 px-3 py-2 ring-1 ring-black/5">Clinician-readable output</li>
              </ul>
            </article>
          </div>
        </section>
      </main>
    </div>
  );
}