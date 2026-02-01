"use client";

import { useState, useMemo } from "react";
import { Job, Category } from "@/types/job";
import { JobCard } from "./JobCard";
import { JobModal } from "./JobModal";
import { CategoryFilter } from "./CategoryFilter";
import { SearchBar } from "./SearchBar";

interface JobBoardProps {
  jobs: Job[];
  categories: Category[];
  lastUpdated: string;
}

export function JobBoard({ jobs, categories, lastUpdated }: JobBoardProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const jobCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    jobs.forEach((job) => {
      counts[job.category.id] = (counts[job.category.id] || 0) + 1;
    });
    return counts;
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    let filtered = jobs;

    if (selectedCategory) {
      filtered = filtered.filter((job) => job.category.id === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(query) ||
          job.body.toLowerCase().includes(query) ||
          job.labels.some((label) => label.name.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [jobs, selectedCategory, searchQuery]);

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
          onSelectCategory={setSelectedCategory}
          jobCounts={jobCounts}
        />
        <p className="text-sm text-zinc-500 dark:text-zinc-400 shrink-0">
          Atualizado em {formattedDate}
        </p>
      </div>

      <SearchBar value={searchQuery} onChange={setSearchQuery} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredJobs.map((job) => (
          <JobCard key={job.id} job={job} onClick={() => setSelectedJob(job)} />
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

      {selectedJob && (
        <JobModal job={selectedJob} onClose={() => setSelectedJob(null)} />
      )}
    </div>
  );
}
