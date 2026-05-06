import Link from "next/link";

import { NavSettingsIcon } from "@/components/app/AppTabIcons";
import { DeenNotesCompactLogo } from "@/components/brand/DeenNotesCompactLogo";
import { DeenNotesLogo } from "@/components/brand/DeenNotesLogo";
import { DesktopAppNav } from "@/components/DesktopAppNav";
import { MobileAppNav } from "@/components/MobileAppNav";
import { PwaInstallPrompt } from "@/components/pwa/PwaInstallPrompt";
import { DashboardProviders } from "@/components/app/NewNoteMenuContext";
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
    <DashboardProviders>
      <div className="min-h-dvh bg-background flex flex-col md:flex-row">
      <aside className="hidden md:flex md:flex-col md:w-56 md:shrink-0 border-r border-black/5 bg-surface p-6 gap-6 min-h-dvh">
        <Link
          href="/app"
          aria-label="DeenNotes — Dashboard home"
          className="rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <DeenNotesLogo size="md" className="items-start" />
        </Link>
        <DesktopAppNav />
        <div className="flex-1 min-h-[1rem]" aria-hidden />
        <Link
          href="/app/settings"
          className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-muted hover:text-accent hover:bg-accent-soft/40 transition-colors"
        >
          <NavSettingsIcon className="h-4 w-4" />
          Settings
        </Link>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 border-b border-black/5 bg-background/90 backdrop-blur-md md:hidden pt-[env(safe-area-inset-top)]">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
            <Link
              href="/app"
              aria-label="DeenNotes — Dashboard home"
              className="rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent min-w-0 shrink"
            >
              <DeenNotesCompactLogo size="md" />
            </Link>
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs text-muted truncate max-w-[7rem] sm:max-w-[40%]">
                {user?.email}
              </span>
              <Link
                href="/app/settings"
                aria-label="Settings"
                className="shrink-0 rounded-full border border-black/8 p-2 text-muted hover:text-accent hover:border-accent/25 transition-colors"
              >
                <NavSettingsIcon className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </header>

        <main className="touch-scroll-y flex-1 max-w-2xl w-full mx-auto px-4 py-6 md:py-10 pb-[max(8.5rem,calc(7rem+env(safe-area-inset-bottom)))] md:pb-10 overscroll-y-contain">
          <PwaInstallPrompt />
          {children}
        </main>
      </div>

      <MobileAppNav />
    </div>
    </DashboardProviders>
  );
}
