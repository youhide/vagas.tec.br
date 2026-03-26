import { MetadataRoute } from "next";
import { getJobsDirect } from "@/lib/cache";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    {
      url: "https://vagas.tec.br",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
  ];

  try {
    const data = await getJobsDirect();
    for (const job of data.jobs) {
      entries.push({
        url: `https://vagas.tec.br/vaga/${job.id}`,
        lastModified: new Date(job.updatedAt),
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  } catch {
    // If fetching jobs fails, return just the homepage
  }

  return entries;
}
