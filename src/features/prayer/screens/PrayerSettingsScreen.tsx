"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { readPrayerPrefs, writePrayerPrefs } from "@/lib/browser/prayer-prefs";
import { APP_DISCLAIMER } from "@/lib/constants";
import { createWebNoopPrayerReminderScheduler } from "@/lib/prayer/notifications";
import type { PrayerPrefsStored } from "@/lib/prayer/prefs-shape";
import {
  DEFAULT_PRAYER_REMINDER_PREFS,
  readPrayerReminderPreferences,
  REMINDER_LEAD_OPTIONS,
  writePrayerReminderPreferences,
  type ObligatoryPrayerReminderKey,
  type ReminderLeadMinutes,
} from "@/lib/prayer/reminder-preferences";
import { requestBrowserNotificationPermission } from "@/lib/prayer/web-browser-reminders";
import { CALCULATION_METHOD_OPTIONS, MADHAB_OPTIONS } from "@/lib/prayer/types";

const PRAYER_TOGGLE_ORDER: {
  key: ObligatoryPrayerReminderKey;
  label: string;
}[] = [
  { key: "Fajr", label: "Fajr" },
  { key: "Dhuhr", label: "Dhuhr" },
  { key: "Asr", label: "Asr" },
  { key: "Maghrib", label: "Maghrib" },
  { key: "Isha", label: "Isha" },
];

export function PrayerSettingsScreen() {
  const searchParams = useSearchParams();
  const remindersAnchorRef = useRef<HTMLElement | null>(null);
  const [prefs, setPrefs] = useState(readPrayerPrefs);
  const [reminders, setReminders] = useState(readPrayerReminderPreferences);
  const [saved, setSaved] = useState(false);
  const [notifSupported, setNotifSupported] = useState(false);
  const [notifPermission, setNotifPermission] =
    useState<NotificationPermission>("default");

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotifSupported(true);
      setNotifPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    if (searchParams.get("focus") !== "reminders") return;
    const el = remindersAnchorRef.current;
    if (!el) return;
    window.requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [searchParams]);

  const persistPrayerPrefs = useCallback((next: PrayerPrefsStored) => {
    const { notifications: _omit, ...rest } = next;
    void _omit;
    writePrayerPrefs(rest);
    setPrefs(rest);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  }, []);

  return (
    <div className="max-w-lg mx-auto space-y-8 pb-28">
      <header className="space-y-2">
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-emerald-900/80">
          Settings
        </p>
        <h1 className="font-display text-[1.85rem] font-semibold text-ink leading-tight">
          Prayer preferences
        </h1>
        <p className="text-sm text-muted leading-relaxed">
          Local first — these choices shape how we ask the server for times. Nothing here claims
          authority over your community.
        </p>
      </header>

      <section className="rounded-[1.35rem] border border-black/[0.06] bg-[#F9F6F1]/90 p-5 space-y-5 shadow-sm">
        <p className="text-xs text-muted leading-relaxed">{APP_DISCLAIMER}</p>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block space-y-1">
            <span className="text-[0.7rem] font-bold uppercase tracking-wide text-muted">City</span>
            <input
              className="w-full rounded-xl border border-black/[0.08] bg-white px-3 py-2 text-sm"
              value={prefs.city}
              onChange={(e) =>
                setPrefs((p) => ({
                  ...p,
                  city: e.target.value,
                  useBrowserLocation: false,
                }))
              }
            />
          </label>
          <label className="block space-y-1">
            <span className="text-[0.7rem] font-bold uppercase tracking-wide text-muted">
              Country
            </span>
            <input
              className="w-full rounded-xl border border-black/[0.08] bg-white px-3 py-2 text-sm"
              value={prefs.country}
              onChange={(e) =>
                setPrefs((p) => ({
                  ...p,
                  country: e.target.value,
                  useBrowserLocation: false,
                }))
              }
            />
          </label>
        </div>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="mt-1 rounded border-black/20"
            checked={prefs.useBrowserLocation === true}
            onChange={(e) =>
              setPrefs((p) => ({
                ...p,
                useBrowserLocation: e.target.checked,
              }))
            }
          />
          <span className="text-sm text-muted leading-relaxed">
            When timings load, prefer my device&apos;s approximate area first. If permission is denied,
            we&apos;ll quietly use city and country here — otherwise Providence as a fallback.
          </span>
        </label>

        <label className="block space-y-1">
          <span className="text-[0.7rem] font-bold uppercase tracking-wide text-muted">
            Minute adjustment (all prayers)
          </span>
          <input
            type="number"
            min={-6}
            max={6}
            className="w-full rounded-xl border border-black/[0.08] bg-white px-3 py-2 text-sm"
            value={prefs.hijriAdjustment ?? 0}
            onChange={(e) => {
              const n = Math.trunc(Number(e.target.value));
              setPrefs((p) => ({
                ...p,
                hijriAdjustment: Number.isFinite(n) ? Math.max(-6, Math.min(6, n)) : 0,
              }));
            }}
          />
          <span className="text-[0.65rem] text-muted">
            AlAdhan tuning in minutes (+/−). Consult local scholarship if unsure.
          </span>
        </label>

        <label className="block space-y-1">
          <span className="text-[0.7rem] font-bold uppercase tracking-wide text-muted">
            Calculation method
          </span>
          <select
            className="w-full rounded-xl border border-black/[0.08] bg-white px-3 py-2 text-sm"
            value={prefs.method}
            onChange={(e) =>
              setPrefs((p) => ({
                ...p,
                method: Number(e.target.value),
              }))
            }
          >
            {CALCULATION_METHOD_OPTIONS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-1">
          <span className="text-[0.7rem] font-bold uppercase tracking-wide text-muted">Madhab (Asr)</span>
          <select
            className="w-full rounded-xl border border-black/[0.08] bg-white px-3 py-2 text-sm"
            value={prefs.school}
            onChange={(e) =>
              setPrefs((p) => ({
                ...p,
                school: e.target.value === "1" ? 1 : 0,
              }))
            }
          >
            {MADHAB_OPTIONS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={() => persistPrayerPrefs(prefs)}
          className="w-full rounded-2xl bg-emerald-950 px-4 py-3 text-sm font-semibold text-white shadow-md hover:bg-emerald-900 transition-colors"
        >
          Save location &amp; method
        </button>
        {saved ? (
          <p className="text-xs text-emerald-800 text-center" role="status">
            Saved on this device.
          </p>
        ) : null}
      </section>

      <section
        ref={remindersAnchorRef}
        id="prayer-reminders"
        className="rounded-[1.35rem] border border-emerald-950/12 bg-white/85 p-5 space-y-5 shadow-sm"
      >
        <div className="space-y-2">
          <h2 className="font-display text-lg font-semibold text-ink">Prayer reminders</h2>
          <p className="text-xs text-muted leading-relaxed">
            Remind me before prayer — a quiet nudge here in the app. Push alerts will follow on mobile
            with the same settings; they stay on this device for now.
          </p>
        </div>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="mt-1 rounded border-black/20"
            checked={reminders.quietRemindersEnabled}
            onChange={(e) =>
              setReminders((r) => ({
                ...r,
                quietRemindersEnabled: e.target.checked,
              }))
            }
          />
          <span className="text-sm text-muted leading-relaxed">
            Gentle in-app reminders on Today &amp; Prayer{" "}
            <span className="text-emerald-950/85"> — help me pause when I get busy.</span>
          </span>
        </label>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="mt-1 rounded border-black/20"
            checked={reminders.browserAlertsEnabled}
            disabled={!reminders.quietRemindersEnabled}
            onChange={(e) =>
              setReminders((r) => ({
                ...r,
                browserAlertsEnabled: e.target.checked,
              }))
            }
          />
          <span className="text-sm text-muted leading-relaxed">
            Optional browser alerts when supported — no push server; reminders schedule in this
            browsing session.
          </span>
        </label>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={!notifSupported}
            onClick={async () => {
              await requestBrowserNotificationPermission();
              if ("Notification" in window) {
                setNotifPermission(Notification.permission);
              }
            }}
            className="rounded-full border border-emerald-950/22 bg-emerald-950/[0.07] px-4 py-2 text-xs font-semibold text-emerald-950 hover:bg-emerald-950/10 disabled:opacity-40"
          >
            Ask permission once
          </button>
          <span className="text-[0.7rem] text-muted tabular-nums">
            {notifSupported ? `Alerts: ${notifPermission}` : "Notifications not available here"}
          </span>
        </div>

        <label className="block space-y-2">
          <span className="text-[0.7rem] font-bold uppercase tracking-wide text-muted">
            A quiet reminder before salah
          </span>
          <select
            className="w-full rounded-xl border border-black/[0.08] bg-white px-3 py-2.5 text-sm"
            disabled={!reminders.quietRemindersEnabled}
            value={reminders.leadMinutes}
            onChange={(e) =>
              setReminders((r) => ({
                ...r,
                leadMinutes: Number(e.target.value) as ReminderLeadMinutes,
              }))
            }
          >
            {REMINDER_LEAD_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <span className="text-[0.65rem] text-muted block">
            You can align this with how early you like to soften into wudu — no pressure either way.
          </span>
        </label>

        <div className="space-y-2">
          <p className="text-[0.7rem] font-bold uppercase tracking-wide text-muted">Daily prayers</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {PRAYER_TOGGLE_ORDER.map(({ key, label }) => (
              <label
                key={key}
                className="flex items-center gap-2.5 rounded-xl border border-black/[0.06] bg-[#FBF9F5]/90 px-3 py-3 cursor-pointer"
              >
                <input
                  type="checkbox"
                  className="rounded border-black/20"
                  disabled={!reminders.quietRemindersEnabled}
                  checked={reminders.prayers[key]}
                  onChange={(e) =>
                    setReminders((r) => ({
                      ...r,
                      prayers: {
                        ...r.prayers,
                        [key]: e.target.checked,
                      },
                    }))
                  }
                />
                <span className="text-sm text-ink">{label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-[0.7rem] font-bold uppercase tracking-wide text-muted">
            Rhythm &amp; Ramadan
          </p>
          <label className="flex items-center gap-3 rounded-xl border border-black/[0.06] px-3 py-2.5 cursor-pointer">
            <input
              type="checkbox"
              className="rounded border-black/20"
              disabled={!reminders.quietRemindersEnabled}
              checked={reminders.jumuah}
              onChange={(e) =>
                setReminders((r) => ({ ...r, jumuah: e.target.checked }))
              }
            />
            <span className="text-sm text-muted">Jumu&apos;ah reminder (uses your Dhuhr time)</span>
          </label>
          <label className="flex items-center gap-3 rounded-xl border border-black/[0.06] px-3 py-2.5 cursor-pointer">
            <input
              type="checkbox"
              className="rounded border-black/20"
              disabled={!reminders.quietRemindersEnabled}
              checked={reminders.ramadanSuhoor}
              onChange={(e) =>
                setReminders((r) => ({ ...r, ramadanSuhoor: e.target.checked }))
              }
            />
            <span className="text-sm text-muted">Suhoor (before Fajr)</span>
          </label>
          <label className="flex items-center gap-3 rounded-xl border border-black/[0.06] px-3 py-2.5 cursor-pointer">
            <input
              type="checkbox"
              className="rounded border-black/20"
              disabled={!reminders.quietRemindersEnabled}
              checked={reminders.ramadanIftar}
              onChange={(e) =>
                setReminders((r) => ({ ...r, ramadanIftar: e.target.checked }))
              }
            />
            <span className="text-sm text-muted">Iftar (before Maghrib)</span>
          </label>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => {
              writePrayerReminderPreferences(reminders);
              void createWebNoopPrayerReminderScheduler().cancelAllPrayerReminders();
              setSaved(true);
              window.setTimeout(() => setSaved(false), 2200);
            }}
            className="flex-1 rounded-2xl bg-emerald-950 px-4 py-3 text-sm font-semibold text-white shadow-md hover:bg-emerald-900 transition-colors"
          >
            Save reminder preferences
          </button>
          <button
            type="button"
            onClick={() => setReminders({ ...DEFAULT_PRAYER_REMINDER_PREFS })}
            className="rounded-2xl border border-black/[0.1] px-4 py-3 text-xs font-semibold text-muted hover:text-ink"
          >
            Reset
          </button>
        </div>
        <p className="text-[0.68rem] text-muted leading-relaxed">
          Expo / native builds can subscribe to{" "}
          <code className="text-emerald-900/90 rounded bg-black/[0.04] px-1">buildNativePrayerReminderOutline</code> plus
          fresh <code className="rounded bg-black/[0.04] px-1">/api/prayer/today</code> to schedule OS notifications —
          not wired in the browser yet.
        </p>
      </section>

      <section className="rounded-[1.35rem] border border-black/[0.06] bg-stone-100/50 p-5 space-y-3">
        <h2 className="font-display text-lg font-semibold text-ink">Ramadan preferences</h2>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="rounded border-black/20"
            checked={prefs.ramadan?.tonightAyahReminder !== false}
            onChange={(e) =>
              setPrefs((p) => ({
                ...p,
                ramadan: {
                  ...p.ramadan,
                  tonightAyahReminder: e.target.checked,
                  postTarawihNotesNudge: p.ramadan?.postTarawihNotesNudge ?? false,
                },
              }))
            }
          />
          <span className="text-sm text-muted">Tonight&apos;s ayah nudge (UI only for now)</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="rounded border-black/20"
            checked={Boolean(prefs.ramadan?.postTarawihNotesNudge)}
            onChange={(e) =>
              setPrefs((p) => ({
                ...p,
                ramadan: {
                  ...p.ramadan,
                  tonightAyahReminder: p.ramadan?.tonightAyahReminder ?? true,
                  postTarawihNotesNudge: e.target.checked,
                },
              }))
            }
          />
          <span className="text-sm text-muted">Post-taraweeh notes reminder (UI)</span>
        </label>
        <button
          type="button"
          onClick={() => persistPrayerPrefs(prefs)}
          className="mt-2 w-full rounded-xl border border-emerald-950/18 bg-white px-4 py-3 text-xs font-semibold text-emerald-950 hover:bg-emerald-950/5"
        >
          Save Ramadan preferences with location &amp; method
        </button>
      </section>
    </div>
  );
}
