import { describe, expect, it } from "vitest";
import { Job } from "@/types/job";
import { CATEGORIES } from "./categories";
import { buildSyncPlan } from "./sync";

const NOW = "2026-07-01T06:00:00.000Z";

function makeJob(id: number, categoryIndex: number): Job {
  const category = CATEGORIES[categoryIndex];
  return {
    id,
    title: `Vaga ${id}`,
    body: "Corpo",
    url: `https://github.com/${category.owner}/${category.repo}/issues/${id}`,
    labels: [{ name: "Remoto", color: "#0e8a16" }],
    createdAt: "2026-06-01T12:00:00Z",
    updatedAt: "2026-06-02T12:00:00Z",
    author: "recruiter",
    authorAvatar: "",
    repository: `${category.owner}/${category.repo}`,
    category,
    locationType: "remoto",
    seniority: ["pleno"],
  };
}

describe("buildSyncPlan", () => {
  it("builds upsert rows without first_seen_at so inserts keep the default", () => {
    const { rows } = buildSyncPlan([makeJob(1, 0)], [CATEGORIES[0].id], NOW);

    expect(rows).toHaveLength(1);
    expect(rows[0]).not.toHaveProperty("first_seen_at");
    expect(rows[0].state).toBe("open");
    expect(rows[0].last_seen_at).toBe(NOW);
    expect(rows[0].category_id).toBe(CATEGORIES[0].id);
    expect(rows[0].location_type).toBe("remoto");
    expect(rows[0].seniority).toEqual(["pleno"]);
  });

  it("never emits a close target for a category whose fetch failed", () => {
    const jobs = [makeJob(1, 0), makeJob(2, 1)];
    const succeededOnly = [CATEGORIES[0].id];

    const { closeTargets } = buildSyncPlan(jobs, succeededOnly, NOW);

    expect(closeTargets).toEqual([
      { categoryId: CATEGORIES[0].id, openIds: [1] },
    ]);
  });

  it("emits an empty openIds list for a successful category with zero jobs", () => {
    const { closeTargets } = buildSyncPlan([], [CATEGORIES[0].id], NOW);

    // Categoria buscada com sucesso e sem vagas abertas: tudo dela fecha
    expect(closeTargets).toEqual([
      { categoryId: CATEGORIES[0].id, openIds: [] },
    ]);
  });

  it("groups open ids per category", () => {
    const jobs = [makeJob(1, 0), makeJob(2, 0), makeJob(3, 1)];
    const succeeded = [CATEGORIES[0].id, CATEGORIES[1].id];

    const { closeTargets } = buildSyncPlan(jobs, succeeded, NOW);

    expect(closeTargets).toEqual([
      { categoryId: CATEGORIES[0].id, openIds: [1, 2] },
      { categoryId: CATEGORIES[1].id, openIds: [3] },
    ]);
  });
});
