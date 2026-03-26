"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Job, Category } from "@/types/job";
import { JobCard } from "./JobCard";
import { JobModal } from "./JobModal";
import { CategoryFilter } from "./CategoryFilter";
import { SearchBar } from "./SearchBar";

const JOBS_PER_PAGE = 21;

type SortOption = "newest" | "oldest" | "alpha";

interface JobBoardProps {
  jobs: Job[];
  categories: Category[];
  lastUpdated: string;
}

export function JobBoard({ jobs, categories, lastUpdated }: JobBoardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    searchParams.get("cat") || null
  );
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortOption>(
    (searchParams.get("sort") as SortOption) || "newest"
  );
  const [favorites, setFavorites] = useState<Set<number>>(() => {
    if (typeof window === "undefined") return new Set<number>();
    try {
      const stored = localStorage.getItem("vagas-favorites");
      if (stored) return new Set(JSON.parse(stored) as number[]);
    } catch { }
    return new Set<number>();
  });
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const toggleFavorite = useCallback((id: number) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem("vagas-favorites", JSON.stringify([...next]));
      return next;
    });
  }, []);

  // Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Sync state to URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("q", debouncedSearch);
    if (selectedCategory) params.set("cat", selectedCategory);
    if (sortBy !== "newest") params.set("sort", sortBy);
    const qs = params.toString();
    router.replace(qs ? `?${qs}` : "/", { scroll: false });
  }, [debouncedSearch, selectedCategory, sortBy, router]);

  // Reset page when filters change
  const filterKey = `${debouncedSearch}|${selectedCategory}|${sortBy}|${showFavoritesOnly}`;
  const stableFilterKey = useMemo(() => filterKey, [filterKey]);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: reset pagination when filters change
    setCurrentPage(1);
  }, [stableFilterKey]);

  const jobCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    jobs.forEach((job) => {
      counts[job.category.id] = (counts[job.category.id] || 0) + 1;
    });
    return counts;
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    let filtered = jobs;

    if (showFavoritesOnly) {
      filtered = filtered.filter((job) => favorites.has(job.id));
    }

    if (selectedCategory) {
      filtered = filtered.filter((job) => job.category.id === selectedCategory);
    }

    if (debouncedSearch.trim()) {
      const query = debouncedSearch.toLowerCase();
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(query) ||
          job.body.toLowerCase().includes(query) ||
          job.labels.some((label) => label.name.toLowerCase().includes(query))
      );
    }

    // Sort
    if (sortBy === "oldest") {
      filtered = [...filtered].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    } else if (sortBy === "alpha") {
      filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title, "pt-BR"));
    }

    return filtered;
  }, [jobs, selectedCategory, debouncedSearch, sortBy, showFavoritesOnly, favorites]);

  const totalPages = Math.ceil(filteredJobs.length / JOBS_PER_PAGE);
  const paginatedJobs = filteredJobs.slice(
    (currentPage - 1) * JOBS_PER_PAGE,
    currentPage * JOBS_PER_PAGE
  );

  const handleCategoryChange = useCallback((id: string | null) => {
    setSelectedCategory(id);
  }, []);

  const formattedDate = new Date(lastUpdated).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={handleCategoryChange}
          jobCounts={jobCounts}
        />
        <p className="text-sm text-zinc-500 dark:text-zinc-400 shrink-0">
          Atualizado em {formattedDate}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFavoritesOnly((v) => !v)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${showFavoritesOnly
                ? "border-pink-300 dark:border-pink-700 bg-pink-50 dark:bg-pink-950/30 text-pink-600 dark:text-pink-400"
                : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
              }`}
            aria-label={showFavoritesOnly ? "Mostrar todas as vagas" : "Mostrar somente favoritos"}
            aria-pressed={showFavoritesOnly}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill={showFavoritesOnly ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <span className="hidden sm:inline">Favoritos</span>
            {favorites.size > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-xs bg-pink-100 dark:bg-pink-900/50 text-pink-600 dark:text-pink-400">
                {favorites.size}
              </span>
            )}
          </button>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="newest">Mais recentes</option>
            <option value="oldest">Mais antigas</option>
            <option value="alpha">A → Z</option>
          </select>
        </div>
      </div>

      {/* Job count */}
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Mostrando{" "}
        <span className="font-semibold text-zinc-700 dark:text-zinc-300">
          {filteredJobs.length}
        </span>{" "}
        {filteredJobs.length !== jobs.length && (
          <>
            de{" "}
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">
              {jobs.length}
            </span>{" "}
          </>
        )}
        vaga{filteredJobs.length !== 1 ? "s" : ""}
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {paginatedJobs.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            onClick={() => setSelectedJob(job)}
            isFavorite={favorites.has(job.id)}
            onToggleFavorite={toggleFavorite}
          />
        ))}
      </div>

      {filteredJobs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-zinc-500 dark:text-zinc-400 text-lg">
            Nenhuma vaga encontrada
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="mt-2 text-blue-500 hover:text-blue-600 text-sm"
            >
              Limpar busca
            </button>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-lg text-sm font-medium border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            ← Anterior
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((page) => {
                if (totalPages <= 7) return true;
                if (page === 1 || page === totalPages) return true;
                if (Math.abs(page - currentPage) <= 1) return true;
                return false;
              })
              .map((page, idx, arr) => {
                const showEllipsis = idx > 0 && page - arr[idx - 1] > 1;
                return (
                  <span key={page} className="flex items-center gap-1">
                    {showEllipsis && (
                      <span className="px-2 text-zinc-400">…</span>
                    )}
                    <button
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${currentPage === page
                          ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
                          : "border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        }`}
                    >
                      {page}
                    </button>
                  </span>
                );
              })}
          </div>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-lg text-sm font-medium border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Próxima →
          </button>
        </div>
      )}

      {selectedJob && (
        <JobModal job={selectedJob} onClose={() => setSelectedJob(null)} />
      )}
    </div>
  );
}
