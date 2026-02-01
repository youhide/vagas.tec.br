"use client";

import { Category } from "@/types/job";

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
  jobCounts: Record<string, number>;
}

export function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
  jobCounts,
}: CategoryFilterProps) {
  const totalJobs = Object.values(jobCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelectCategory(null)}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === null
          ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
          }`}
      >
        <span>📋</span>
        <span>Todas</span>
        <span className={`px-2 py-0.5 rounded-full text-xs ${selectedCategory === null
          ? "bg-white/20 dark:bg-zinc-900/20 text-white dark:text-zinc-900"
          : "bg-zinc-200 dark:bg-zinc-700"
          }`}>
          {totalJobs}
        </span>
      </button>

      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onSelectCategory(category.id)}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === category.id
            ? "text-white"
            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
            }`}
          style={
            selectedCategory === category.id
              ? { backgroundColor: category.color }
              : {}
          }
        >
          <span>{category.emoji}</span>
          <span>{category.name}</span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs ${selectedCategory === category.id
              ? "bg-white/20"
              : "bg-zinc-200 dark:bg-zinc-700"
              }`}
          >
            {jobCounts[category.id] || 0}
          </span>
        </button>
      ))}
    </div>
  );
}
