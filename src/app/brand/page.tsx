import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Brand",
  description: "DeenNotes AI internal brand reference — wordmark and app marks.",
};

export default function BrandSheetPage() {
  return (
    <div className="min-h-dvh bg-[#fafaf8] text-[#1a1917] font-sans text-sm antialiased leading-relaxed">
      <div className="mx-auto max-w-[880px] px-6 py-12 sm:px-10 sm:py-16 md:py-20 md:pb-24">
        <p className="mb-14 text-[11px] font-normal uppercase tracking-[0.12em] text-[#8a8580]">
          DeenNotes AI
        </p>

        <div className="grid gap-12 sm:gap-14 md:gap-[4.5rem]">
          <section aria-label="Primary wordmark" className="flex flex-col items-start gap-4">
            <div className="flex items-baseline gap-[0.45rem] font-display font-medium text-[clamp(2rem,4.5vw,2.75rem)] leading-none tracking-tight text-accent">
              <span>DeenNotes</span>
              <span className="font-sans text-[0.68em] font-light uppercase tracking-[0.14em] text-accent">
                AI
              </span>
            </div>
            <div className="relative h-3 w-full max-w-56 shrink-0" aria-hidden>
              <div className="absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_75%_100%_at_50%_50%,rgba(18,122,99,0.4)_0%,rgba(18,122,99,0.14)_45%,transparent_72%)] blur-[0.6px]" />
            </div>
          </section>

          <section
            aria-label="App icons"
            className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] items-start gap-8 sm:gap-10 md:gap-14"
          >
            <div className="flex flex-col items-start gap-5">
              <svg
                className="h-28 w-28 shrink-0"
                viewBox="0 0 64 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden
              >
                <defs>
                  <linearGradient
                    id="brandSheetGlowLight"
                    x1="10"
                    y1="0"
                    x2="54"
                    y2="0"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#127A63" stopOpacity="0" />
                    <stop offset="0.5" stopColor="#127A63" stopOpacity="0.48" />
                    <stop offset="1" stopColor="#127A63" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <rect width="64" height="64" rx="18" fill="#F6F4F0" />
                <text
                  x="32"
                  y="40"
                  textAnchor="middle"
                  fontFamily="Georgia, Times New Roman, serif"
                  fontSize="26"
                  fontWeight="600"
                  fill="#127A63"
                >
                  DN
                </text>
                <ellipse
                  cx="32"
                  cy="48"
                  rx="20"
                  ry="2"
                  fill="url(#brandSheetGlowLight)"
                />
              </svg>
              <p className="max-w-[11rem] text-xs leading-snug tracking-wide text-[#8a8580]">
                App icon — light background.
              </p>
            </div>
            <div className="flex flex-col items-start gap-5">
              <svg
                className="h-28 w-28 shrink-0"
                viewBox="0 0 64 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden
              >
                <defs>
                  <linearGradient
                    id="brandSheetGlowDark"
                    x1="10"
                    y1="0"
                    x2="54"
                    y2="0"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#F6F4F0" stopOpacity="0" />
                    <stop offset="0.5" stopColor="#F6F4F0" stopOpacity="0.42" />
                    <stop offset="1" stopColor="#F6F4F0" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <rect width="64" height="64" rx="18" fill="#127A63" />
                <text
                  x="32"
                  y="40"
                  textAnchor="middle"
                  fontFamily="Georgia, Times New Roman, serif"
                  fontSize="26"
                  fontWeight="600"
                  fill="#F6F4F0"
                >
                  DN
                </text>
                <ellipse
                  cx="32"
                  cy="48"
                  rx="20"
                  ry="2"
                  fill="url(#brandSheetGlowDark)"
                />
              </svg>
              <p className="max-w-[11rem] text-xs leading-snug tracking-wide text-[#8a8580]">
                App icon — dark background.
              </p>
            </div>
          </section>

          <section
            aria-label="Secondary mark"
            className="border-t border-black/[0.06] pt-2 text-accent"
          >
            <svg
              className="h-20 w-20 text-accent"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden
            >
              <path
                stroke="currentColor"
                strokeWidth="1.45"
                strokeLinejoin="round"
                d="M14 12h15l7 7v19a2 2 0 0 1-2 2H14a2 2 0 0 1-2-2V14a2 2 0 0 1 2-2Z"
              />
              <path
                stroke="currentColor"
                strokeWidth="1.45"
                strokeLinejoin="round"
                d="M29 12v6a2 2 0 0 0 2 2h6"
              />
              <line
                x1="17"
                y1="22"
                x2="31"
                y2="22"
                stroke="currentColor"
                strokeWidth="1.35"
                strokeLinecap="round"
              />
              <line
                x1="17"
                y1="27"
                x2="28"
                y2="27"
                stroke="currentColor"
                strokeWidth="1.35"
                strokeLinecap="round"
              />
              <line
                x1="17"
                y1="32"
                x2="30"
                y2="32"
                stroke="currentColor"
                strokeWidth="1.35"
                strokeLinecap="round"
              />
              <path
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m12 38 2-3.5a3 3 0 0 1 1.6-1.2M14.5 35.5c.8-.4 1.5-.5 2.2-.3m1.6 1.8a2 2 0 0 0-.4-1.6"
              />
            </svg>
            <p className="mt-5 max-w-[11rem] text-xs leading-snug tracking-wide text-[#8a8580]">
              Secondary — notes, lists, and empty states. Not the app mark.
            </p>
          </section>
        </div>

        <footer className="mt-14 border-t border-black/[0.06] pt-7 text-xs text-[#8a8580] sm:mt-20">
          Internal reference. Production assets live in{" "}
          <code className="text-[11px] text-[#1a1917]/80">src/components/brand/</code>{" "}
          and <code className="text-[11px] text-[#1a1917]/80">src/app/icon.svg</code>.
        </footer>
      </div>
    </div>
  );
}
