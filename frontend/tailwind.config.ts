import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./widgets/**/*.{js,ts,jsx,tsx,mdx}",
    "./shared/**/*.{js,ts,jsx,tsx,mdx}",
    "./entities/**/*.{js,ts,jsx,tsx,mdx}",
    "./data/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"]
      },
      colors: {
        background: "var(--background)",
        surface: "var(--surface)",
        card: "var(--card)",
        elevated: "var(--elevated)",
        primary: "var(--primary)",
        "primary-hover": "var(--primary-hover)",
        "primary-active": "var(--primary-active)",
        "accent-blue": "var(--accent-blue)",
        "accent-pink": "var(--accent-pink)",
        "accent-green": "var(--accent-green)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-muted": "var(--text-muted)",
        border: "var(--border)"
      },
      borderRadius: {
        xs: "6px",
        sm: "10px",
        md: "16px",
        lg: "20px",
        xl: "24px"
      },
      boxShadow: {
        card: "var(--shadow-card)",
        hero: "var(--shadow-hero)",
        floating: "var(--shadow-floating)"
      }
    }
  },
  plugins: []
};

export default config;
