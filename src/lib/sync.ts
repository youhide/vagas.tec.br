import { Job, Label, LocationType, Seniority } from "@/types/job";

// Linha da tabela `jobs` enviada no upsert do cron.
// `first_seen_at` é deliberadamente omitido: o DEFAULT NOW() preenche no
// insert e colunas ausentes do payload não são tocadas no conflito.
export interface JobUpsertRow {
  id: number;
  title: string;
  body: string;
  url: string;
  labels: Label[];
  category_id: string;
  repository: string;
  author: string;
  author_avatar: string;
  created_at: string;
  updated_at: string;
  state: "open";
  location_type: LocationType | null;
  seniority: Seniority[];
  last_seen_at: string;
}

export interface CloseTarget {
  categoryId: string;
  // Ids vistos como abertos nesta sincronização; tudo fora desta lista
  // (na mesma categoria) deve ser marcado como closed.
  openIds: number[];
}

export interface SyncPlan {
  rows: JobUpsertRow[];
  closeTargets: CloseTarget[];
}

// Decide o que gravar a partir do resultado do fetch. Puro para ser testável:
// a regra crítica é que categorias que FALHARAM no fetch nunca geram
// closeTarget — senão um fetch flaky fecharia todas as vagas da categoria.
export function buildSyncPlan(
  jobs: Job[],
  succeededCategoryIds: string[],
  now: string
): SyncPlan {
  const rows: JobUpsertRow[] = jobs.map((job) => ({
    id: job.id,
    title: job.title,
    body: job.body,
    url: job.url,
    labels: job.labels,
    category_id: job.category.id,
    repository: job.repository,
    author: job.author,
    author_avatar: job.authorAvatar,
    created_at: job.createdAt,
    updated_at: job.updatedAt,
    state: "open",
    location_type: job.locationType,
    seniority: job.seniority,
    last_seen_at: now,
  }));

  const closeTargets: CloseTarget[] = succeededCategoryIds.map(
    (categoryId) => ({
      categoryId,
      openIds: jobs
        .filter((job) => job.category.id === categoryId)
        .map((job) => job.id),
    })
  );

  return { rows, closeTargets };
}
