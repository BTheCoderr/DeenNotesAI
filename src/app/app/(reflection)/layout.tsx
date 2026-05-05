import Link from "next/link";

import { DeenNotesCompactLogo } from "@/components/brand/DeenNotesCompactLogo";

export default function ReflectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="sticky top-0 z-20 border-b border-mint/50 bg-background/90 backdrop-blur-md">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex justify-center">
            <Link
              href="/app"
              aria-label="DeenNotes — App home"
              className="rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <DeenNotesCompactLogo size="md" />
            </Link>
          </div>
        </div>
      </header>
      {children}
    </>
  );
}
