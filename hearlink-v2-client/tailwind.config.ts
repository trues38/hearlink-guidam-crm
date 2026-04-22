import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "rgba(var(--background), <alpha-value>)",
        foreground: "rgba(var(--foreground), <alpha-value>)",
        surface: {
          DEFAULT: "rgba(var(--surface), <alpha-value>)",
          hover: "rgba(var(--surface-hover), <alpha-value>)",
        },
        border: {
          DEFAULT: "rgba(var(--border), <alpha-value>)",
          hover: "rgba(var(--border-hover), <alpha-value>)",
        },
        muted: {
          DEFAULT: "rgba(var(--muted), <alpha-value>)",
          bg: "rgba(var(--muted-bg), <alpha-value>)",
        },
        brand: {
          DEFAULT: "rgba(var(--brand), <alpha-value>)",
          hover: "rgba(var(--brand-hover), <alpha-value>)",
          muted: "rgba(var(--brand-muted), <alpha-value>)",
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
        }
      },
    },
  },
  plugins: [],
};
export default config;
