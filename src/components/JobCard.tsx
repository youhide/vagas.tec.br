"use client";

import { Job } from "@/types/job";
import { formatDistanceToNow } from "@/lib/utils";

interface JobCardProps {
  job: Job;
  onClick: () => void;
  isFavorite: boolean;
  onToggleFavorite: (id: number) => void;
}

export function JobCard({ job, onClick, isFavorite, onToggleFavorite }: JobCardProps) {
  const timeAgo = formatDistanceToNow(new Date(job.createdAt));

  return (
    <div className="relative block w-full text-left bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 hover:border-zinc-400 dark:hover:border-zinc-600 hover:shadow-lg transition-all duration-200 group">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite(job.id);
        }}
        className="absolute top-3 right-3 p-1.5 rounded-lg text-zinc-300 dark:text-zinc-600 hover:text-pink-500 dark:hover:text-pink-400 transition-colors z-10"
        aria-label={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" className={isFavorite ? "text-pink-500" : ""} />
        </svg>
      </button>
      <button
        onClick={onClick}
        className="w-full text-left cursor-pointer"
      >
        <div className="flex items-start gap-3">
          <div
            className="w-2 h-2 rounded-full mt-2 shrink-0"
            style={{ backgroundColor: job.category.color }}
          />
          <div className="flex-1 min-w-0 pr-6">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
              {job.title}
            </h3>

            <div className="flex items-center gap-2 mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              <span className="flex items-center gap-1">
                <span>{job.category.emoji}</span>
                <span>{job.category.name}</span>
              </span>
              <span>•</span>
              <span>{timeAgo}</span>
            </div>

            {job.labels.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {job.labels.slice(0, 5).map((label) => (
                  <span
                    key={label.name}
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: `${label.color}20`,
                      color: label.color,
                      border: `1px solid ${label.color}40`,
                    }}
                  >
                    {label.name}
                  </span>
                ))}
                {job.labels.length > 5 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800">
                    +{job.labels.length - 5}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </button>
    </div>
  );
}
