import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage            from "./pages/LandingPage";
import ProfileSetupPage       from "./pages/ProfileSetupPage";
import ProfileSetupCompletePage from "./pages/ProfileSetupCompletePage";
import ProfilePage            from "./pages/ProfilePage";
import IntakePage             from "./pages/IntakePage";
import SchedulingPage         from "./pages/SchedulingPage";
import AppointmentPage        from "./pages/AppointmentPage";
import VisitSummaryPage       from "./pages/VisitSummaryPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"               element={<LandingPage />} />
        <Route path="/setup"          element={<ProfileSetupPage />} />
        <Route path="/setup/complete" element={<ProfileSetupCompletePage />} />
        <Route path="/profile"        element={<ProfilePage />} />
        <Route path="/intake"         element={<IntakePage />} />
        <Route path="/scheduling"     element={<SchedulingPage />} />
        <Route path="/appointment"    element={<AppointmentPage />} />
        <Route path="/visit-summary"  element={<VisitSummaryPage />} />
        {/* Legacy redirect */}
        <Route path="/form"           element={<Navigate to="/intake" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
