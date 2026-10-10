import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0A0A0A",
        surface: "#111111",
        surface2: "#1A1A1A",
        wine: {
          DEFAULT: "#6B1D2A",
          light: "#8C2F3E",
          glow: "#A0344A",
        },
        fg: "#F5F5F5",
        muted: "#888888",
        line: "#262626",
      },
      fontFamily: {
        display: ["var(--font-space-grotesk)", "sans-serif"],
        sans: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
      boxShadow: {
        "wine-glow": "0 0 24px rgba(107, 29, 42, 0.35)",
        "wine-subtle": "0 0 12px rgba(107, 29, 42, 0.2)",
      },
    },
  },
  plugins: [],
};
export default config;