import { MetadataRoute } from "next";
import { getOpenJobs } from "@/lib/cache";
import { supabase } from "@/lib/supabase";

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
    if (supabase) {
      const { data, error } = await supabase
        .from("jobs")
        .select("id, updated_at")
        .eq("state", "open");

      if (!error && data && data.length > 0) {
        for (const job of data) {
          entries.push({
            url: `https://vagas.tec.br/vaga/${job.id}`,
            lastModified: new Date(job.updated_at),
            changeFrequency: "weekly",
            priority: 0.7,
          });
        }
        return entries;
      }
    }

    // Fallback: tabela vazia ou Supabase indisponível
    const data = await getOpenJobs();
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
