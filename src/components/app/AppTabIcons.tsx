"use client";

type IconProps = { className?: string };

export function NavNotesIcon({ className }: IconProps) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M8 6h13M8 12h13M8 18h13" />
      <path d="M4 20V4l2 1.25L8 4v16l-2-1.25L4 20Z" />
    </svg>
  );
}

export function NavTodayIcon({ className }: IconProps) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M20.84 5.61a5.5 5.5 0 0 0-7.78 0L12 6.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l8.72 8.72a1 1 0 0 0 1.42 0l8.72-8.72a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

/** Plus centered in a soft capsule outline — FAB accent. */
export function NavNewFabIcon({ className }: IconProps) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.85}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="4" y="7" width="16" height="10" rx="4.5" />
      <path d="M12 10v4M10 12h4" />
    </svg>
  );
}

export function NavQuranIcon({ className }: IconProps) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M6 4h10a3 3 0 0 1 3 3v13H9a3 3 0 0 1-3-3V4Z" />
      <path d="M9 20V7a3 3 0 0 1 3-3" />
      <path d="M9 11h8M9 15h6" />
    </svg>
  );
}

export function NavPrayerIcon({ className }: IconProps) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v5l3 2" />
    </svg>
  );
}

export function NavSettingsIcon({ className }: IconProps) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}
