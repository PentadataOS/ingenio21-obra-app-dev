import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          violet: "#6d28d9",
          indigo: "#4f46e5",
          blue: "#3b82f6",
          cyan: "#22d3ee",
        },
        ink: "#16182b",
        muted: "#6b7280",
        surface: "#f6f7f9",
        card: "#ffffff",
        line: "#eceef2",
        ok: "#16a34a",
        warn: "#d97706",
        danger: "#dc2626",
        review: "#ea580c",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "sans-serif"],
      },
      borderRadius: { xl2: "1.1rem" },
      boxShadow: {
        card: "0 1px 2px rgba(16,18,43,.04), 0 8px 24px rgba(16,18,43,.06)",
        sheet: "0 -8px 40px rgba(16,18,43,.12)",
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(100deg, #6d28d9 0%, #4f46e5 45%, #22d3ee 100%)",
      },
    },
  },
  plugins: [],
};
export default config;
