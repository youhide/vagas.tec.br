import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "vagas.tec.br - Vagas de Tecnologia",
    short_name: "vagas.tec.br",
    description:
      "Encontre vagas de DevOps, Backend e tecnologia das maiores comunidades brasileiras.",
    start_url: "/",
    display: "standalone",
    background_color: "#fafafa",
    theme_color: "#3b82f6",
    icons: [
      {
        src: "/icon-192.svg",
        sizes: "192x192",
        type: "image/svg+xml",
      },
      {
        src: "/icon-512.svg",
        sizes: "512x512",
        type: "image/svg+xml",
      },
    ],
  };
}
