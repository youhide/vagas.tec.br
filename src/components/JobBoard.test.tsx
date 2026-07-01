import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { JobSummary } from "@/types/job";
import { CATEGORIES } from "@/lib/categories";
import { JobBoard } from "./JobBoard";

const replaceMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock }),
  useSearchParams: () => new URLSearchParams(),
}));

function category(id: string) {
  const found = CATEGORIES.find((cat) => cat.id === id);
  if (!found) throw new Error(`Categoria de teste desconhecida: ${id}`);
  return found;
}

const jobs: JobSummary[] = [
  {
    id: 1,
    title: "Dev Backend Sênior",
    url: "https://github.com/backend-br/vagas/issues/1",
    labels: [{ name: "Remoto", color: "#0e8a16" }],
    createdAt: "2026-06-03T12:00:00Z",
    updatedAt: "2026-06-03T12:00:00Z",
    author: "a",
    authorAvatar: "",
    repository: "backend-br/vagas",
    category: category("backend"),
    locationType: "remoto",
    seniority: ["senior"],
    excerpt: "Vaga para backend com Node.js",
  },
  {
    id: 2,
    title: "Dev Frontend Júnior",
    url: "https://github.com/frontendbr/vagas/issues/2",
    labels: [{ name: "Presencial", color: "#d73a4a" }],
    createdAt: "2026-06-02T12:00:00Z",
    updatedAt: "2026-06-02T12:00:00Z",
    author: "b",
    authorAvatar: "",
    repository: "frontendbr/vagas",
    category: category("frontend"),
    locationType: "presencial",
    seniority: ["junior"],
    excerpt: "Vaga para frontend com React",
  },
  {
    id: 3,
    title: "Engenheiro DevOps Pleno",
    url: "https://github.com/DevOps-Brasil/Vagas/issues/3",
    labels: [{ name: "Híbrido", color: "#fbca04" }],
    createdAt: "2026-06-01T12:00:00Z",
    updatedAt: "2026-06-01T12:00:00Z",
    author: "c",
    authorAvatar: "",
    repository: "DevOps-Brasil/Vagas",
    category: category("devops"),
    locationType: "hibrido",
    seniority: ["pleno"],
    excerpt: "Vaga para devops com Kubernetes",
  },
];

function renderBoard() {
  return render(
    <JobBoard
      jobs={jobs}
      categories={CATEGORIES}
      lastUpdated="2026-06-30T06:00:00Z"
    />
  );
}

function visibleTitles(): string[] {
  return screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent ?? "");
}

beforeEach(() => {
  window.localStorage.clear();
  replaceMock.mockClear();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("JobBoard", () => {
  it("renders every job initially", () => {
    renderBoard();
    expect(visibleTitles()).toHaveLength(3);
  });

  it("filters by category", async () => {
    const user = userEvent.setup();
    renderBoard();

    await user.click(screen.getByRole("button", { name: /Filtrar por Backend/ }));

    expect(visibleTitles()).toEqual(["Dev Backend Sênior"]);
  });

  it("filters by debounced search over title", async () => {
    vi.useFakeTimers();
    renderBoard();

    fireEvent.change(screen.getByRole("textbox", { name: "Buscar vagas" }), {
      target: { value: "júnior" },
    });
    expect(visibleTitles()).toHaveLength(3); // ainda dentro do debounce

    await act(() => vi.advanceTimersByTimeAsync(300));

    expect(visibleTitles()).toEqual(["Dev Frontend Júnior"]);
  });

  it("filters by excerpt content", async () => {
    vi.useFakeTimers();
    renderBoard();

    fireEvent.change(screen.getByRole("textbox", { name: "Buscar vagas" }), {
      target: { value: "kubernetes" },
    });
    await act(() => vi.advanceTimersByTimeAsync(300));

    expect(visibleTitles()).toEqual(["Engenheiro DevOps Pleno"]);
  });

  it("toggles the remote facet filter", async () => {
    const user = userEvent.setup();
    renderBoard();

    const remoteChip = screen.getByRole("button", { name: "Remoto" });
    await user.click(remoteChip);
    expect(visibleTitles()).toEqual(["Dev Backend Sênior"]);

    await user.click(remoteChip);
    expect(visibleTitles()).toHaveLength(3);
  });

  it("filters by seniority facet", async () => {
    const user = userEvent.setup();
    renderBoard();

    await user.click(screen.getByRole("button", { name: "Pleno" }));

    expect(visibleTitles()).toEqual(["Engenheiro DevOps Pleno"]);
  });

  it("stores favorites and filters by them", async () => {
    const user = userEvent.setup();
    renderBoard();

    const firstCard = screen
      .getByRole("heading", { level: 3, name: "Dev Backend Sênior" })
      .closest("div.relative") as HTMLElement;
    await user.click(
      within(firstCard).getByRole("button", { name: "Adicionar aos favoritos" })
    );

    expect(
      JSON.parse(window.localStorage.getItem("vagas-favorites") ?? "[]")
    ).toEqual([1]);

    await user.click(
      screen.getByRole("button", { name: "Mostrar somente favoritos" })
    );

    expect(visibleTitles()).toEqual(["Dev Backend Sênior"]);
  });
});
