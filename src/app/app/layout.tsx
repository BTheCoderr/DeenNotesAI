import Link from "next/link";

import { DesktopAppNav } from "@/components/DesktopAppNav";
import { MobileAppNav } from "@/components/MobileAppNav";
import { createClient } from "@/lib/supabase/server";

export default async function AppSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-dvh bg-background flex flex-col md:flex-row">
      <aside className="hidden md:flex md:flex-col md:w-56 md:shrink-0 border-r border-black/5 bg-surface p-6 gap-8">
        <Link href="/app" className="font-display text-lg font-semibold text-ink">
          DeenNotes
        </Link>
        <DesktopAppNav />
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 border-b border-black/5 bg-background/90 backdrop-blur-md md:hidden">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
            <Link
              href="/app"
              className="font-display text-lg font-semibold text-ink"
            >
              DeenNotes
            </Link>
            <span className="text-xs text-muted truncate max-w-[40%]">
              {user?.email}
            </span>
          </div>
        </header>

        <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-6 md:py-10 pb-28 md:pb-10">
          {children}
        </main>
      </div>

      <MobileAppNav />
    </div>
  );
}
