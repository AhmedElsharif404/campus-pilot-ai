import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CampusPilot AI",
    short_name: "CampusPilot",
    description:
      "A privacy-aware academic planning workspace for college students.",
    start_url: "/app/today",
    display: "standalone",
    background_color: "#f4f0e8",
    theme_color: "#173a5e",
    icons: [
      { src: "/icon", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
