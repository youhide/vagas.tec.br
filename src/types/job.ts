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
}

export interface Label {
  name: string;
  color: string;
}

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
