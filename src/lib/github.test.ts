import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  fetchAllJobs,
  fetchWithRetry,
  GitHubRateLimitError,
} from "./github";
import { CATEGORIES } from "./categories";

function response(
  status: number,
  body: unknown = [],
  headers: Record<string, string> = {}
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...headers },
  });
}

function rateLimitHeaders(resetInSeconds: number): Record<string, string> {
  return {
    "x-ratelimit-limit": "60",
    "x-ratelimit-remaining": "0",
    "x-ratelimit-used": "60",
    "x-ratelimit-reset": String(Math.floor(Date.now() / 1000) + resetInSeconds),
  };
}

const issue = {
  id: 1,
  title: "Desenvolvedor Backend Pleno - Remoto na ACME",
  body: "Descrição da vaga",
  html_url: "https://github.com/backend-br/vagas/issues/1",
  labels: [{ name: "Remoto", color: "0e8a16" }],
  created_at: "2026-06-01T12:00:00Z",
  updated_at: "2026-06-02T12:00:00Z",
  user: { login: "recruiter", avatar_url: "https://example.com/a.png" },
  state: "open",
};

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("fetchWithRetry", () => {
  it("returns the response on first success", async () => {
    const fetchMock = vi.fn().mockResolvedValue(response(200, []));
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchWithRetry("https://api.github.com/x", {});

    expect(result.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("retries server errors with exponential backoff", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(response(500))
      .mockResolvedValueOnce(response(500))
      .mockResolvedValueOnce(response(200, []));
    vi.stubGlobal("fetch", fetchMock);

    const promise = fetchWithRetry("https://api.github.com/x", {});
    await vi.advanceTimersByTimeAsync(1000 + 2000);

    const result = await promise;
    expect(result.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("throws after exhausting retries", async () => {
    const fetchMock = vi.fn().mockResolvedValue(response(500));
    vi.stubGlobal("fetch", fetchMock);

    const promise = fetchWithRetry("https://api.github.com/x", {});
    const assertion = expect(promise).rejects.toThrow("GitHub API error: 500");
    await vi.advanceTimersByTimeAsync(1000 + 2000);
    await assertion;
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("waits for the rate limit reset when it is near", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(response(403, [], rateLimitHeaders(60)))
      .mockResolvedValueOnce(response(200, []));
    vi.stubGlobal("fetch", fetchMock);

    const promise = fetchWithRetry("https://api.github.com/x", {});
    await vi.advanceTimersByTimeAsync(61_000);

    const result = await promise;
    expect(result.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("throws GitHubRateLimitError when the reset is far away", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(response(403, [], rateLimitHeaders(30 * 60)));
    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchWithRetry("https://api.github.com/x", {})).rejects.toThrow(
      GitHubRateLimitError
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe("fetchAllJobs", () => {
  it("maps issues to jobs with parsed facets", async () => {
    const fetchMock = vi.fn().mockImplementation(() =>
      Promise.resolve(response(200, [issue]))
    );
    vi.stubGlobal("fetch", fetchMock);

    const { jobs, succeededCategoryIds, failedCategoryIds } =
      await fetchAllJobs();

    expect(failedCategoryIds).toEqual([]);
    expect(succeededCategoryIds).toHaveLength(CATEGORIES.length);
    expect(jobs).toHaveLength(CATEGORIES.length);

    const job = jobs[0];
    expect(job.title).toBe(issue.title);
    expect(job.labels).toEqual([{ name: "Remoto", color: "#0e8a16" }]);
    expect(job.author).toBe("recruiter");
    expect(job.locationType).toBe("remoto");
    expect(job.seniority).toEqual(["pleno"]);
  });

  it("filters out templates and pull requests, handles null body/user", async () => {
    const issues = [
      { ...issue, id: 2, title: "[TEMPLATE] Nome da vaga" },
      {
        ...issue,
        id: 4,
        title: "chore(deps): bump actions/cache",
        pull_request: { url: "https://api.github.com/x" },
      },
      { ...issue, id: 3, body: null, user: null },
    ];
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(() => Promise.resolve(response(200, issues)))
    );

    const { jobs } = await fetchAllJobs();

    const perCategory = jobs.filter(
      (job) => job.category.id === CATEGORIES[0].id
    );
    expect(perCategory).toHaveLength(1);
    expect(perCategory[0].body).toBe("");
    expect(perCategory[0].author).toBe("Unknown");
  });

  it("reports failed categories without dropping the others", async () => {
    const failing = CATEGORIES[0];
    const fetchMock = vi.fn().mockImplementation((url: string) =>
      Promise.resolve(
        url.includes(`${failing.owner}/${failing.repo}`)
          ? response(404)
          : response(200, [issue])
      )
    );
    vi.stubGlobal("fetch", fetchMock);

    const promise = fetchAllJobs();
    await vi.advanceTimersByTimeAsync(10_000);
    const { jobs, succeededCategoryIds, failedCategoryIds } = await promise;

    expect(failedCategoryIds).toEqual([failing.id]);
    expect(succeededCategoryIds).toHaveLength(CATEGORIES.length - 1);
    expect(jobs.some((job) => job.category.id === failing.id)).toBe(false);
    expect(jobs).toHaveLength(CATEGORIES.length - 1);
  });
});
