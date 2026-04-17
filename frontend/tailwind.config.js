/** @type {import('tailwindcss').Config} */
<<<<<<< HEAD
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
=======
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#FF5A7D',
          light: '#FFB3C6',
          dark: '#E5476A',
        },
        secondary: {
          DEFAULT: '#5C80E5',
          light: '#A3B9F5',
          dark: '#4A6BC9',
        },
        typography: {
          DEFAULT: '#333333',
          light: '#666666',
          lighter: '#999999',
        },
        active: '#FF5A7D',
        important: '#4ECDC4',
        neutral: '#9CA3AF',
        disabled: '#D1D5DB',
        bg: {
          primary: '#FFFFFF',
          secondary: '#FFF5F7',
          tertiary: '#F0F4FF',
          neutral: '#F9FAFB',
        },
>>>>>>> 8fb6db013e3b2504ce02978b5b3f8805fb88bfd9
      },
    },
  },
  plugins: [],
<<<<<<< HEAD
};
=======
}
>>>>>>> 8fb6db013e3b2504ce02978b5b3f8805fb88bfd9
