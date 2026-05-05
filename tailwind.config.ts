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
        background: "#F6F4F0",
        surface: "#FDFCF9",
        ink: "#1c1b18",
        muted: "#5c5a54",
        /** Brand tagline / soft labels — do not replace global `muted` for body copy */
        stoneMuted: "#7A756C",
        mint: "#CFE8E0",
        stoneWarm: "#F6F4F0",
        accent: {
          DEFAULT: "#127A63",
          soft: "#CFE8E0",
          hover: "#0f6b56",
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
