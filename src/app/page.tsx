import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { JobBoard } from "@/components/JobBoard";
import { RateLimitError } from "@/components/RateLimitError";
import { getJobsDirect } from "@/lib/cache";
import { GitHubRateLimitError } from "@/lib/github";
import { CATEGORIES } from "@/lib/categories";
import { Job } from "@/types/job";

// Revalidate every hour
export const revalidate = 3600;

function generateWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "vagas.tec.br",
    url: "https://vagas.tec.br",
    description:
      "Quadro de vagas de tecnologia das comunidades brasileiras. DevOps, Backend e muito mais.",
  };
}

export default async function Home() {
  let jobs: Job[] = [];
  let error: GitHubRateLimitError | null = null;
  const lastUpdated = new Date().toISOString();

  try {
    const data = await getJobsDirect();
    jobs = data.jobs;
  } catch (e) {
    if (e instanceof GitHubRateLimitError) {
      error = e;
    } else {
      console.error("Failed to fetch jobs:", e);
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateWebsiteSchema()) }}
      />
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col">
        <Header />

        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
              🚀 Vagas de Tecnologia
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              Encontre sua próxima oportunidade na área de tecnologia. Vagas
              coletadas das comunidades brasileiras.
            </p>
          </div>

          {error ? (
            <RateLimitError resetTime={error.rateLimit.reset} />
          ) : (
            <JobBoard
              jobs={jobs}
              categories={CATEGORIES}
              lastUpdated={lastUpdated}
            />
          )}
        </main>

        <Footer />
      </div>
    </>
  );
}
