import { cn } from "@/lib/utils";

type Props = {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
};

/**
 * Consistent stacked title for dashboards and feature hubs.
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  className,
}: Props) {
  return (
    <div className={cn("space-y-2", className)}>
      {eyebrow ? (
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-accent">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="font-display text-lg font-semibold text-ink sm:text-xl">
        {title}
      </h2>
      {description ? (
        <p className="text-sm text-muted leading-relaxed max-w-prose">
          {description}
        </p>
      ) : null}
    </div>
  );
}
