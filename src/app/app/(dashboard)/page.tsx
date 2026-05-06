import { DashboardHome } from "@/components/dashboard/DashboardHome";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: latest } = await supabase
    .from("deen_notes")
    .select("id, title, note_type, created_at, short_summary, summary")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return <DashboardHome latest={latest} />;
}
