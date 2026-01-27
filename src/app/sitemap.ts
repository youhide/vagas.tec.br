import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://vagas.tec.br",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
  ];
}
