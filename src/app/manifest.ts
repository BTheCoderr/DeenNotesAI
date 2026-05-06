import type { MetadataRoute } from "next";

/** PWA manifest — standalone shell; `/app` default entry when installed. */

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "DeenNotes AI · Islamic reflection companion",
    short_name: "DeenNotes",
    description:
      "Calm Quran reading, salah rhythm, Hijri grounding, and local-first reflections.",
    lang: "en",
    dir: "ltr",
    start_url: "/app",
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui"],
    orientation: "portrait-primary",
    background_color: "#F6F4F0",
    theme_color: "#127A63",
    categories: ["lifestyle", "education", "productivity"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
