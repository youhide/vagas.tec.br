import { getOpenJobs } from "@/lib/cache";

export const revalidate = 3600;

const FEED_SIZE = 50;
const SITE_URL = "https://vagas.tec.br";

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  let items = "";
  let lastBuildDate = new Date().toUTCString();

  try {
    const data = await getOpenJobs();
    lastBuildDate = new Date(data.lastUpdated).toUTCString();

    items = data.jobs
      .slice(0, FEED_SIZE)
      .map((job) => {
        const link = `${SITE_URL}/vaga/${job.id}`;
        return `    <item>
      <title>${escapeXml(job.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${new Date(job.createdAt).toUTCString()}</pubDate>
      <category>${escapeXml(job.category.name)}</category>
    </item>`;
      })
      .join("\n");
  } catch {
    // Sem vagas disponíveis: feed vazio ainda é um RSS válido
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>vagas.tec.br</title>
    <link>${SITE_URL}</link>
    <description>Vagas de tecnologia das comunidades brasileiras</description>
    <language>pt-BR</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
