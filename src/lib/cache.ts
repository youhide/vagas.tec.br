import { Category, Job, JobsData, JobWithState } from "@/types/job";
import { CATEGORIES } from "./categories";
import { fetchAllJobs } from "./github";
import { JobRow, supabase, supabaseAdmin } from "./supabase";
import { buildSyncPlan } from "./sync";

const STALE_HOURS = 24;
const UPSERT_CHUNK_SIZE = 500;
// 100 issues/repo (página única) × categorias deixa folga sob esse teto
const MAX_ROWS = 1000;

export interface RefreshResult extends JobsData {
  closedCount: number;
  failedCategoryIds: string[];
}

// Dedupe concurrent refreshes so simultaneous requests share one GitHub fetch
let refreshPromise: Promise<RefreshResult> | null = null;

// Metadados de categoria (nome/emoji/cor) vivem em categories.ts; o banco
// guarda só category_id. Vagas de categorias removidas ganham um fallback
// neutro em vez de quebrar a renderização.
function findCategory(categoryId: string, repository: string): Category {
  const known = CATEGORIES.find((category) => category.id === categoryId);
  if (known) return known;

  const [owner = "", repo = repository] = repository.split("/");
  return {
    id: categoryId,
    name: categoryId,
    emoji: "💼",
    repo,
    owner,
    color: "#71717A",
  };
}

function rowToJob(row: JobRow): Job {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    url: row.url,
    labels: row.labels ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    author: row.author,
    authorAvatar: row.author_avatar,
    repository: row.repository,
    category: findCategory(row.category_id, row.repository),
    locationType: row.location_type,
    seniority: row.seniority ?? [],
  };
}

function rowToJobWithState(row: JobRow): JobWithState {
  return {
    ...rowToJob(row),
    state: row.state,
    closedDetectedAt: row.closed_detected_at,
  };
}

export async function getOpenJobs(): Promise<JobsData> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("state", "open")
        .order("created_at", { ascending: false })
        .limit(MAX_ROWS);

      if (!error && data && data.length > 0) {
        const lastUpdated = data.reduce(
          (max, row) => (row.last_seen_at > max ? row.last_seen_at : max),
          data[0].last_seen_at
        );
        const hoursAgo =
          (Date.now() - new Date(lastUpdated).getTime()) / (1000 * 60 * 60);

        if (hoursAgo < STALE_HOURS) {
          return {
            jobs: data.map(rowToJob),
            lastUpdated,
            categories: CATEGORIES,
          };
        }
      }
    } catch (error) {
      console.log("Supabase read failed:", error);
    }
  }

  // Tabela vazia/velha ou Supabase indisponível: busca direto do GitHub.
  // É também o caminho de "migração" — um Supabase zerado se popula sozinho.
  if (!refreshPromise) {
    refreshPromise = refreshJobs().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

export async function getJobById(id: string): Promise<JobWithState | null> {
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) return null;

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", numericId)
        .maybeSingle();

      if (!error && data) return rowToJobWithState(data);
    } catch (error) {
      console.log("Supabase read failed:", error);
    }
  }

  // Fallback (dev local sem Supabase ou tabela ainda vazia)
  try {
    const { jobs } = await getOpenJobs();
    const job = jobs.find((candidate) => candidate.id === numericId);
    return job ? { ...job, state: "open", closedDetectedAt: null } : null;
  } catch {
    return null;
  }
}

export async function refreshJobs(): Promise<RefreshResult> {
  console.log("Fetching fresh jobs from GitHub...");
  const { jobs, succeededCategoryIds, failedCategoryIds } =
    await fetchAllJobs();
  const now = new Date().toISOString();

  let closedCount = 0;

  if (supabaseAdmin && jobs.length > 0) {
    const { rows, closeTargets } = buildSyncPlan(
      jobs,
      succeededCategoryIds,
      now
    );

    for (let i = 0; i < rows.length; i += UPSERT_CHUNK_SIZE) {
      const chunk = rows.slice(i, i + UPSERT_CHUNK_SIZE);
      const { error } = await supabaseAdmin
        .from("jobs")
        .upsert(chunk, { onConflict: "id" });
      if (error) {
        console.error("Failed to upsert jobs chunk:", error.message);
      }
    }

    for (const target of closeTargets) {
      let query = supabaseAdmin
        .from("jobs")
        .update({ state: "closed", closed_detected_at: now })
        .eq("category_id", target.categoryId)
        .eq("state", "open");

      if (target.openIds.length > 0) {
        query = query.not("id", "in", `(${target.openIds.join(",")})`);
      }

      const { data, error } = await query.select("id");
      if (error) {
        console.error(
          `Failed to close jobs for ${target.categoryId}:`,
          error.message
        );
      } else {
        closedCount += data?.length ?? 0;
      }
    }

    console.log(
      `Jobs synced: ${jobs.length} open, ${closedCount} closed, ` +
        `${failedCategoryIds.length} categories failed`
    );
  }

  return {
    jobs,
    lastUpdated: now,
    categories: CATEGORIES,
    closedCount,
    failedCategoryIds,
  };
}
