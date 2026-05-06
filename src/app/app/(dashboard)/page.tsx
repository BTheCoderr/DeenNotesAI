import { DashboardHome } from "@/components/dashboard/DashboardHome";
import { asQuranRefs } from "@/lib/quran/quran-refs-json";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: rows } = await supabase
    .from("deen_notes")
    .select("id, title, note_type, created_at, short_summary, summary, main_reminder, quran_refs")
    .order("created_at", { ascending: false })
    .limit(6);

  const first = rows?.[0];
  const latest = first
    ? {
        id: first.id,
        title: first.title,
        note_type: first.note_type,
        created_at: first.created_at,
        short_summary: first.short_summary,
        summary: first.summary,
        main_reminder:
          typeof first.main_reminder === "string" ? first.main_reminder : "",
        quran_refs: asQuranRefs(first.quran_refs),
      }
    : null;

  const recent =
    rows
      ?.filter((r) => (latest ? r.id !== latest.id : true))
      .slice(0, 3)
      .map((r) => ({
        id: r.id,
        title: r.title,
        note_type: r.note_type,
        created_at: r.created_at,
      })) ?? [];

  return <DashboardHome latest={latest} recent={recent} />;
}
