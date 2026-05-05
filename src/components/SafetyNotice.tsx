import { APP_DISCLAIMER } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function SafetyNotice({ className }: { className?: string }) {
  return (
    <footer
      className={cn(
        "text-muted text-center text-sm leading-relaxed px-4 py-6 max-w-3xl mx-auto",
        className,
      )}
    >
      {APP_DISCLAIMER}
    </footer>
  );
}
