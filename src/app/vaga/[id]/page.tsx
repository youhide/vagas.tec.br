import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getJobById } from "@/lib/cache";
import { parseCompany } from "@/lib/parse";
import { supabase } from "@/lib/supabase";
import { excerptFromMarkdown, formatDistanceToNow, stripMarkdown } from "@/lib/utils";
import { JobWithState } from "@/types/job";
import { JobDetailClient } from "./client";

export const revalidate = 3600;
export const dynamicParams = true;

interface PageProps {
  params: Promise<{ id: string }>;
}

// Pré-renderiza as vagas abertas no build; novas vagas continuam sendo
// renderizadas on-demand (dynamicParams) e revalidadas a cada hora
export async function generateStaticParams() {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("jobs")
    .select("id")
    .eq("state", "open")
    .limit(1000);

  if (error || !data) return [];
  return data.map((row) => ({ id: String(row.id) }));
}

function generateJobPostingSchema(job: JobWithState) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    datePosted: job.createdAt,
    description: stripMarkdown(job.body) || job.title,
    url: `https://vagas.tec.br/vaga/${job.id}`,
    directApply: false,
    industry: "Technology",
  };

  // Sem hiringOrganization confiável a página não qualifica para o Google
  // Jobs — trade-off aceito: melhor omitir do que apontar a comunidade
  // como empregadora
  const company = parseCompany(job.title);
  if (company) {
    schema.hiringOrganization = { "@type": "Organization", name: company };
  }

  if (job.locationType === "remoto") {
    schema.jobLocationType = "TELECOMMUTE";
  }

  const labelText = job.labels.map((label) => label.name.toLowerCase());
  const employmentType: string[] = [];
  if (labelText.some((name) => name.includes("clt"))) {
    employmentType.push("FULL_TIME");
  }
  if (labelText.some((name) => name.includes("pj"))) {
    employmentType.push("CONTRACTOR");
  }
  if (employmentType.length > 0) schema.employmentType = employmentType;

  if (job.state === "closed" && job.closedDetectedAt) {
    schema.validThrough = job.closedDetectedAt;
  }

  return schema;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const job = await getJobById(id);
  if (!job) return {};

  const description = job.body
    ? excerptFromMarkdown(job.body, 160)
    : `Vaga de ${job.category.name} em ${job.repository}`;

  return {
    title: job.title,
    description,
    openGraph: {
      title: job.title,
      description,
      type: "article",
      publishedTime: job.createdAt,
    },
    twitter: {
      card: "summary_large_image",
      title: job.title,
      description,
    },
  };
}

export default async function JobPage({ params }: PageProps) {
  const { id } = await params;
  const job = await getJobById(id);

  if (!job) notFound();

  const timeAgo = formatDistanceToNow(new Date(job.createdAt));
  const isClosed = job.state === "closed";

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateJobPostingSchema(job)),
        }}
      />
      <Header />

      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
          <Link href="/" className="hover:text-blue-500 transition-colors">← Todas as vagas</Link>
        </nav>

        <article>
          {isClosed && (
            <div className="mb-6 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
              Esta vaga foi encerrada
              {job.closedDetectedAt &&
                ` ${formatDistanceToNow(new Date(job.closedDetectedAt))}`}
              . Ela permanece aqui para referência.
            </div>
          )}

          <div className="flex items-start gap-3 mb-4">
            <div
              className="w-3 h-3 rounded-full mt-1.5 shrink-0"
              style={{ backgroundColor: job.category.color }}
            />
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {job.title}
              </h1>
              <div className="flex items-center gap-2 mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                <span className="flex items-center gap-1">
                  <span>{job.category.emoji}</span>
                  <span>{job.category.name}</span>
                </span>
                <span>•</span>
                <span>{timeAgo}</span>
                <span>•</span>
                <span>por {job.author}</span>
              </div>
            </div>
          </div>

          {/* Labels */}
          {job.labels.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-6">
              {job.labels.map((label) => (
                <span
                  key={label.name}
                  className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: `${label.color}20`,
                    color: label.color,
                    border: `1px solid ${label.color}40`,
                  }}
                >
                  {label.name}
                </span>
              ))}
            </div>
          )}

          {/* Body */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 mb-6">
            <JobDetailClient body={job.body} />
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 flex-1 py-3 px-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold rounded-xl hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              Ver vaga no GitHub
            </a>
          </div>

          <p className="text-xs text-center text-zinc-500 dark:text-zinc-400 mt-4">
            Publicado em <span className="font-medium">{job.repository}</span>
          </p>
        </article>
      </main>

      <Footer />
    </div>
  );
}
