import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AUTO BUILDER Native Shell",
    short_name: "AUTO BUILDER",
    description: "Cloud-first autonomous builder shell",
    start_url: "/",
    display: "standalone",
    background_color: "#090b11",
    theme_color: "#090b11",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml"
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml"
      }
    ]
  };
}
