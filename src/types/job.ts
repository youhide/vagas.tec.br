export type LocationType = "remoto" | "hibrido" | "presencial";

export type Seniority = "junior" | "pleno" | "senior";

export type JobState = "open" | "closed";

export interface Job {
  id: number;
  title: string;
  body: string;
  url: string;
  labels: Label[];
  createdAt: string;
  updatedAt: string;
  author: string;
  authorAvatar: string;
  repository: string;
  category: Category;
  locationType: LocationType | null;
  seniority: Seniority[];
}

export interface JobWithState extends Job {
  state: JobState;
  closedDetectedAt: string | null;
}

// Versão enviada ao client na home: sem o corpo markdown completo (que
// dominava o payload), com um excerpt curto para busca e preview
export type JobSummary = Omit<Job, "body"> & { excerpt: string };

// `type` (não `interface`) para ter index signature implícita — exigido
// pelos tipos do supabase-js quando usado dentro de JobRow
export type Label = {
  name: string;
  color: string;
};

export interface Category {
  id: string;
  name: string;
  emoji: string;
  repo: string;
  owner: string;
  color: string;
}

export interface JobsData {
  jobs: Job[];
  lastUpdated: string;
  categories: Category[];
}
