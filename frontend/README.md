# FemCare — Patient Intake Frontend

React + TypeScript + Tailwind CSS PWA for the pre-visit intake form.

## Setup

```bash
cd frontend
npm install
npm start        # dev server on http://localhost:3000
```

The dev server proxies `/api/*` to `http://localhost:8000` (FastAPI backend).

## Running the full stack

Terminal 1 — backend:
```bash
uvicorn src.api.main:app --reload
```

Terminal 2 — frontend:
```bash
cd frontend && npm start
```

## Test credentials

The prototype uses hardcoded IDs (no auth yet):
- `patient_id`: `test-patient-001`
- `appointment_id`: `test-appt-001`

## Structure

```
src/
├── App.tsx                  # Main app, state, navigation, auto-save
├── api.ts                   # API calls (start, save, submit)
├── types.ts                 # TypeScript types mirroring backend Pydantic models
├── index.css                # Tailwind + component classes
├── components/
│   ├── ProgressBar.tsx      # Step progress indicator
│   └── AutoSaveBadge.tsx    # Saving / saved indicator
└── sections/
    ├── SymptomsSection.tsx
    ├── ReproductiveSection.tsx
    ├── FamilyHistorySection.tsx
    ├── LifestyleSection.tsx
    ├── MedicationsSection.tsx
    ├── QuestionsSection.tsx
    └── ConfirmationScreen.tsx
```
