import Link from "next/link";

import { SettingsForm } from "@/components/settings/SettingsForm";
import { APP_DISCLAIMER } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AccountSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=" + encodeURIComponent("/app/settings/account"));
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="space-y-8 pb-20">
      <div>
        <Link
          href="/app/settings"
          className="text-sm font-semibold text-accent hover:underline inline-block mb-4"
        >
          ← Settings
        </Link>
        <h1 className="font-display text-3xl font-semibold text-ink">Account</h1>
        <p className="text-muted mt-2 text-sm leading-relaxed">{APP_DISCLAIMER}</p>
      </div>
      <SettingsForm
        email={user.email ?? ""}
        displayName={profile?.display_name ?? ""}
      />
    </div>
  );
}
