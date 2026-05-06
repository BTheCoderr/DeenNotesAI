import { cn } from "@/lib/utils";

type Props = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
  className?: string;
};

/** Frosted bar / chip — aligns with sticky navs and FAB-adjacent controls. */
export function GlassPanel({ children, className, ...rest }: Props) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/35 bg-surface/80 shadow-elev-1 backdrop-blur-xl supports-[backdrop-filter]:bg-surface/65",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
