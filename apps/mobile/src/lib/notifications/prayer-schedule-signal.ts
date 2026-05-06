/** Tiny pub/sub so reminder UI can poke the engine without prop drilling everywhere. */

type Fn = () => void;
const listeners: Fn[] = [];

export function bumpPrayerNotificationSchedule(): void {
  for (const f of listeners) f();
}

export function subscribePrayerNotificationSchedule(cb: Fn): () => void {
  listeners.push(cb);
  return () => {
    const idx = listeners.indexOf(cb);
    if (idx >= 0) listeners.splice(idx, 1);
  };
}
