"use client";

export function SurahListSkeletonRows({ count = 7 }: { count?: number }) {
  return (
    <ul className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <li
          key={i}
          className="h-[5.75rem] rounded-[1.35rem] border border-black/[0.04] bg-gradient-to-r from-mint/30 via-surface to-mint/30 bg-[length:200%_100%] shadow-sm animate-ds-shimmer motion-reduce:animate-none"
          style={{ animationDelay: `${i * 70}ms` }}
        />
      ))}
    </ul>
  );
}

export function AyahReaderSkeletonBlocks({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-[1.35rem] border border-black/[0.05] bg-surface px-5 py-4 shadow-sm"
        >
          <div className="h-3 w-8 rounded-full bg-gradient-to-r from-accent/12 via-mint/40 to-accent/12 bg-[length:200%_100%] animate-ds-shimmer motion-reduce:animate-none" />
          <div className="mt-4 mr-0 ml-auto h-20 max-w-[92%] rounded-xl bg-gradient-to-l from-mint/25 via-surface to-mint/15 bg-[length:200%_100%] animate-ds-shimmer motion-reduce:animate-none" />
          <div className="mt-4 h-12 w-full rounded-lg bg-gradient-to-r from-black/[0.05] via-mint/20 to-black/[0.05] bg-[length:200%_100%] animate-ds-shimmer motion-reduce:animate-none" />
        </div>
      ))}
    </div>
  );
}
