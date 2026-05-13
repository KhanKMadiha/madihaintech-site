/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F7F4EF",
        ink: "#1C1917",
        inkMuted: "#57534E",
        accent: "#B45309",
        accentSoft: "#FEF3C7",
        border: "#E7E5E4",
      },
      fontFamily: {
        serif: ['"Lora"', "Georgia", "serif"],
        sans: ['"DM Sans"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(28, 25, 23, 0.06), 0 8px 24px rgba(28, 25, 23, 0.06)",
      },
    },
  },
  plugins: [],
};
