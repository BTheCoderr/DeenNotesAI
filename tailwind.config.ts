import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      keyframes: {
        quranSheetUp: {
          from: {
            opacity: "0.92",
            transform: "translateY(18px)",
          },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        quranSoftIn: {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        dsShimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        quranGlow: {
          "0%, 100%": { opacity: "0.45", transform: "scale(1)" },
          "50%": { opacity: "0.72", transform: "scale(1.04)" },
        },
      },
      animation: {
        "quran-sheet-up": "quranSheetUp 0.42s cubic-bezier(0.22, 1, 0.36, 1) both",
        "quran-soft-in": "quranSoftIn 0.45s ease-out both",
        "ds-shimmer": "dsShimmer 1.85s ease-in-out infinite",
        "quran-glow": "quranGlow 8s ease-in-out infinite",
      },
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
      transitionDuration: {
        "ds-fast": "140ms",
        ds: "240ms",
        "ds-slow": "380ms",
      },
      transitionTimingFunction: {
        "ds-out": "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      backgroundImage: {
        "hero-mesh":
          "radial-gradient(ellipse 110% 80% at 20% -10%, rgba(18,122,99,0.16), transparent 45%), radial-gradient(ellipse 90% 60% at 100% 0%, rgba(207,232,224,0.55), transparent 50%)",
        "card-veil":
          "linear-gradient(135deg, rgba(253,252,249,0.98) 0%, rgba(207,232,224,0.35) 100%)",
      },
      boxShadow: {
        card: "0 1px 2px rgba(28, 27, 24, 0.06), 0 8px 24px rgba(28, 27, 24, 0.06)",
        "elev-1": "0 1px 3px rgba(28,27,24,0.04), 0 4px 12px rgba(28,27,24,0.05)",
        "elev-2": "0 2px 6px rgba(28,27,24,0.05), 0 12px 32px rgba(18,122,99,0.07)",
        "elev-3": "0 8px 24px rgba(28,27,24,0.08), 0 20px 48px rgba(18,122,99,0.1)",
        "elev-fab": "0 4px 16px rgba(18,122,99,0.28), 0 8px 28px rgba(28,27,24,0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
