import { Job, Category, Label } from "@/types/job";
import { CATEGORIES } from "./categories";
import { parseLocationType, parseSeniority } from "./parse";

interface GitHubIssue {
  id: number;
  title: string;
  body: string | null;
  html_url: string;
  labels: Array<{
    name: string;
    color: string;
  }>;
  created_at: string;
  updated_at: string;
  user: {
    login: string;
    avatar_url: string;
  } | null;
  state: string;
  // Presente quando a "issue" é na verdade um pull request
  pull_request?: unknown;
}

export interface GitHubRateLimit {
  limit: number;
  remaining: number;
  reset: Date;
  used: number;
}

export class GitHubRateLimitError extends Error {
  constructor(
    public rateLimit: GitHubRateLimit,
    message?: string
  ) {
    super(message || `GitHub rate limit exceeded. Resets at ${rateLimit.reset.toLocaleString()}`);
    this.name = "GitHubRateLimitError";
  }
}

function parseRateLimit(headers: Headers): GitHubRateLimit {
  const resetUnix = parseInt(headers.get("x-ratelimit-reset") || "0") * 1000;
  return {
    limit: parseInt(headers.get("x-ratelimit-limit") || "60"),
    remaining: parseInt(headers.get("x-ratelimit-remaining") || "0"),
    reset: new Date(Math.max(Date.now(), resetUnix)),
    used: parseInt(headers.get("x-ratelimit-used") || "0"),
  };
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchWithRetry(
  url: string,
  headers: HeadersInit,
  retries = 3,
  backoff = 1000
): Promise<Response> {
  for (let attempt = 0; attempt < retries; attempt++) {
    const response = await fetch(url, {
      headers,
      next: { revalidate: 3600 },
    });

    // Success
    if (response.ok) {
      return response;
    }

    const rateLimit = parseRateLimit(response.headers);

    // Rate limit hit
    if (response.status === 403 || response.status === 429) {
      if (rateLimit.remaining === 0) {
        const waitTime = Math.max(0, rateLimit.reset.getTime() - Date.now());

        // If reset is more than 5 minutes away, throw error
        if (waitTime > 5 * 60 * 1000) {
          throw new GitHubRateLimitError(rateLimit);
        }

        // Otherwise wait for reset
        console.log(`Rate limit hit. Waiting ${Math.ceil(waitTime / 1000)}s for reset...`);
        await sleep(waitTime + 1000);
        continue;
      }
    }

    // Other errors - retry with exponential backoff
    if (attempt < retries - 1) {
      const waitTime = backoff * Math.pow(2, attempt);
      console.log(`Request failed (${response.status}). Retrying in ${waitTime}ms...`);
      await sleep(waitTime);
      continue;
    }

    // Final attempt failed
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }

  throw new Error("Max retries exceeded");
}

async function fetchIssuesFromRepo(category: Category): Promise<Job[]> {
  const url = `https://api.github.com/repos/${category.owner}/${category.repo}/issues?state=open&per_page=100&sort=created&direction=desc`;

  const headers: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "vagas.tec.br",
  };

  // Use GitHub token if available (for higher rate limits)
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  try {
    const response = await fetchWithRetry(url, headers);
    const rateLimit = parseRateLimit(response.headers);

    console.log(
      `[${category.owner}/${category.repo}] Rate limit: ${rateLimit.remaining}/${rateLimit.limit} remaining`
    );

    const issues: GitHubIssue[] = await response.json();

    return issues
      // O endpoint de issues também retorna PRs (ex.: bumps do Dependabot)
      .filter((issue) => !issue.pull_request)
      .filter((issue) => !issue.title.toLowerCase().includes("template"))
      .map((issue) => {
        const labels = issue.labels.map(
          (label): Label => ({
            name: label.name,
            color: `#${label.color}`,
          })
        );

        return {
          id: issue.id,
          title: issue.title,
          body: issue.body || "",
          url: issue.html_url,
          labels,
          createdAt: issue.created_at,
          updatedAt: issue.updated_at,
          author: issue.user?.login || "Unknown",
          authorAvatar: issue.user?.avatar_url || "",
          repository: `${category.owner}/${category.repo}`,
          category,
          locationType: parseLocationType(issue.title, labels),
          seniority: parseSeniority(issue.title, labels),
        };
      });
  } catch (error) {
    console.error(
      `Failed to fetch issues from ${category.owner}/${category.repo}:`,
      error
    );
    // Re-throw so callers can distinguish a failed category from an empty
    // one — closing jobs based on a silently-empty result would mark every
    // job in the category as closed.
    throw error;
  }
}

export interface FetchAllJobsResult {
  jobs: Job[];
  succeededCategoryIds: string[];
  failedCategoryIds: string[];
}

export async function fetchAllJobs(): Promise<FetchAllJobsResult> {
  const jobsPromises = CATEGORIES.map((category) =>
    fetchIssuesFromRepo(category)
  );

  const results = await Promise.allSettled(jobsPromises);

  const allJobs: Job[] = [];
  let hasRateLimitError = false;
  const succeededCategoryIds: string[] = [];
  const failedCategoryIds: string[] = [];

  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      succeededCategoryIds.push(CATEGORIES[index].id);
      allJobs.push(...result.value);
    } else {
      failedCategoryIds.push(CATEGORIES[index].id);
      if (result.reason instanceof GitHubRateLimitError) {
        hasRateLimitError = true;
      }
    }
  });

  if (failedCategoryIds.length > 0 && allJobs.length > 0) {
    console.warn(
      `Returning partial results. Failed to fetch: ${failedCategoryIds.join(", ")}`
    );
  }

  if (hasRateLimitError && allJobs.length === 0) {
    throw new GitHubRateLimitError(
      { limit: 60, remaining: 0, reset: new Date(), used: 60 },
      "GitHub rate limit exceeded. Please try again later or add a GITHUB_TOKEN."
    );
  }

  // Sort by creation date (newest first)
  allJobs.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return { jobs: allJobs, succeededCategoryIds, failedCategoryIds };
}
