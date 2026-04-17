/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Primary pink palette
        pink: {
          50:  "#FDF6F8",
          100: "#FAE8EE",
          200: "#F7D0DC",
          300: "#F4A7B9",  // primary — buttons, active states, progress
          400: "#EF8BA2",
          500: "#E8728A",  // accent — highlights, CTAs
          600: "#E85C7A",  // urgent / strong CTA
          700: "#C94468",
          800: "#A33055",
          900: "#7D1F40",
        },
        // Lavender for routine/success (replaces sage green)
        lavender: {
          50:  "#F5F0FB",
          100: "#EDE4F7",
          200: "#DACCF0",
          300: "#C4A8E0",  // routine indicator
          400: "#AE8DD0",
          500: "#9872BF",
          600: "#7D5AA8",
          700: "#634690",
          800: "#4B3370",
          900: "#352254",
        },
        // Neutrals with warm tint
        warm: {
          50:  "#FDF6F8",  // page background
          100: "#FAF0F3",
          200: "#F5E4EA",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        friendly: "0.01em",
      },
    },
  },
  plugins: [],
};
