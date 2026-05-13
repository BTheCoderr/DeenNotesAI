import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Public embed / direct video URL configured in Netlify (e.g. YouTube watch, Vimeo, or `.mp4`). */
function resolveLandingDemoSrc(): string | null {
  const raw = process.env.NEXT_PUBLIC_LANDING_DEMO_VIDEO_URL?.trim?.() ?? "";
  return /^https?:\/\//i.test(raw) ? raw : null;
}

function youtubeEmbedHref(src: URL): string | null {
  if (src.hostname === "youtu.be") {
    const id = src.pathname.slice(1).split("/")[0];
    return id ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}` : null;
  }

  const pathMatch = /^\/embed\/([^/?]+)/.exec(src.pathname);
  if (
    src.hostname.endsWith("youtube.com") ||
    src.hostname.endsWith("youtube-nocookie.com")
  ) {
    if (pathMatch?.[1]) {
      const id = decodeURIComponent(pathMatch[1]);
      return src.hostname.endsWith("youtube-nocookie.com")
        ? src.toString()
        : `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}`;
    }
    const shorts = /^\/shorts\/([^/?]+)/.exec(src.pathname);
    if (shorts?.[1]) {
      return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(shorts[1])}`;
    }
    const vid = src.searchParams.get("v");
    if (vid) {
      return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(vid)}`;
    }
  }
  return null;
}

function vimeoEmbedHref(src: URL): string | null {
  if (!src.hostname.endsWith("vimeo.com")) return null;
  const pathMatch = /^\/(?:video\/)?(\d+)/.exec(src.pathname);
  const id = pathMatch?.[1];
  return id ? `https://player.vimeo.com/video/${encodeURIComponent(id)}` : null;
}

function EmbedFrame({
  embedSrc,
  title,
}: {
  embedSrc: string;
  title: string;
}) {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-black/[0.08] bg-ink/[0.04] shadow-card">
      <iframe
        title={title}
        src={embedSrc}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        className="absolute inset-0 h-full w-full"
      />
    </div>
  );
}

/** Renders iframe or HTML5 video for known URL shapes; omits markup when unset. */
export function LandingDemoMedia(props: {
  title?: string;
  className?: string;
}) {
  const raw = resolveLandingDemoSrc();
  const title =
    props.title ?? "Short tour of DeenNotes — capture reflection on the go.";
  let body: ReactNode = null;

  if (raw) {
    try {
      const parsed = new URL(raw);
      const yt = youtubeEmbedHref(parsed);
      const vm = vimeoEmbedHref(parsed);
      const lowerPath = parsed.pathname.toLowerCase();

      if (yt) {
        body = <EmbedFrame embedSrc={yt} title={title} />;
      } else if (vm) {
        body = <EmbedFrame embedSrc={vm} title={title} />;
      } else if (/\.mp4(?:\?|$)/i.test(lowerPath)) {
        body = (
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-black/[0.08] bg-ink/[0.04] shadow-card">
            <video
              className="absolute inset-0 h-full w-full object-contain md:object-cover bg-black"
              controls
              preload="metadata"
              playsInline
              src={raw}
            />
          </div>
        );
      } else if (
        /^https:\/\/(www\.)?youtube-nocookie\.com\/embed\//i.test(raw) ||
        /^https:\/\/player\.vimeo\.com\/video\//i.test(raw)
      ) {
        body = <EmbedFrame embedSrc={raw} title={title} />;
      }
    } catch {
      body = null;
    }
  }

  if (!body) return null;

  return (
    <div className={cn("mx-auto max-w-3xl", props.className)}>
      {body}
    </div>
  );
}
