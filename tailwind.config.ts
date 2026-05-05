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
        background: "#f7f6f2",
        surface: "#fdfcfa",
        ink: "#1c1b18",
        muted: "#5c5a54",
        accent: {
          DEFAULT: "#0d6b4d",
          soft: "#e6f2ec",
          hover: "#0a5a40",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-fraunces)", "Georgia", "serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(28, 27, 24, 0.06), 0 8px 24px rgba(28, 27, 24, 0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
