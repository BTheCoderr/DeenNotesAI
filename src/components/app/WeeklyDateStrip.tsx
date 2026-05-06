"use client";

function startOfWeekMonday(d: Date) {
  const x = new Date(d);
  const day = x.getDay(); // 0 Sun
  const diff = (day + 6) % 7; // Monday = 0
  x.setDate(x.getDate() - diff);
  x.setHours(0, 0, 0, 0);
  return x;
}

const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];

export function WeeklyDateStrip() {
  const today = new Date();
  const start = startOfWeekMonday(today);
  const todayKey = today.toDateString();

  return (
    <div className="rounded-2xl border border-black/6 bg-mint/35 px-3 py-3">
      <div className="flex justify-between gap-1 text-center">
        {Array.from({ length: 7 }, (_, i) => {
          const d = new Date(start);
          d.setDate(start.getDate() + i);
          const isToday = d.toDateString() === todayKey;
          return (
            <div key={d.toISOString()} className="flex-1 min-w-0">
              <p className="text-[0.65rem] font-semibold text-muted uppercase tracking-wide">
                {dayLabels[i]}
              </p>
              <div
                className={
                  isToday
                    ? "mt-1.5 mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-accent text-sm font-semibold text-white shadow-sm"
                    : "mt-1.5 mx-auto flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium text-ink/75"
                }
              >
                {d.getDate()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
