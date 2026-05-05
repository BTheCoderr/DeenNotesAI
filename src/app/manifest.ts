import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "DeenNotes AI",
    short_name: "DeenNotes",
    description:
      "Turn khutbahs and Islamic lectures into structured notes, reminders, and reflection prompts.",
    start_url: "/app",
    display: "standalone",
    background_color: "#F6F4F0",
    theme_color: "#127A63",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
