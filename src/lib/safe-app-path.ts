/**
 * Validates `next` for post-login redirects: same-origin relative path under `/app` only.
 * Prevents open redirects from untrusted `?next=` query values.
 */
export function safeAppPath(next: string | null | undefined): string {
  if (!next || !next.startsWith("/app")) {
    return "/app";
  }
  if (next.includes("..") || next.includes("//")) {
    return "/app";
  }
  return next;
}
