import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { clearProfile } from "../profileStore";
import { clearBooking } from "../bookingStore";

interface Props {
  children: React.ReactNode;
  wide?: boolean;
}

export default function Shell({ children, wide }: Props) {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { to: "/",              label: "Home" },
    { to: "/scheduling",    label: "Book" },
    { to: "/intake",        label: "Intake Form" },
    { to: "/appointment",   label: "My Appointment" },
    { to: "/profile",       label: "My Profile" },
    { to: "/visit-summary", label: "Visit Summary" },
  ];

  const handleReset = () => {
    clearProfile();
    clearBooking();
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-warm-50">
      {/* Top nav */}
      <header className="bg-white sticky top-0 z-10" style={{ borderBottom: "1px solid #F7D0DC" }}>
        <div className={`mx-auto ${wide ? "max-w-5xl" : "max-w-3xl"} px-4 py-3 flex items-center gap-4`}>
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="h-7 w-7 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #F4A7B9, #E8728A)" }}>
              <span className="text-white text-xs font-bold">F</span>
            </div>
            <span className="font-semibold text-sm" style={{ color: "#2D2D2D" }}>FemCare</span>
          </Link>

          {/* Nav links */}
          <nav className="flex items-center gap-1 ml-4">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  pathname === to
                    ? "text-pink-700"
                    : "text-gray-400 hover:text-gray-700 hover:bg-pink-50"
                }`}
                style={pathname === to ? { background: "#FAE8EE" } : {}}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Reset demo button */}
          <button
            onClick={handleReset}
            className="ml-auto text-xs font-medium px-3 py-1.5 rounded-lg transition"
            style={{ color: "#9CA3AF", border: "1px solid #F7D0DC" }}
            onMouseEnter={e => { e.currentTarget.style.color = "#E85C7A"; e.currentTarget.style.borderColor = "#F4A7B9"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "#9CA3AF"; e.currentTarget.style.borderColor = "#F7D0DC"; }}
            title="Clear all data and restart the demo"
          >
            ↺ Reset demo
          </button>
        </div>
      </header>

      {/* Content */}
      <main className={`mx-auto ${wide ? "max-w-5xl" : "max-w-3xl"} px-4 py-8`}>
        {children}
      </main>
    </div>
  );
}
