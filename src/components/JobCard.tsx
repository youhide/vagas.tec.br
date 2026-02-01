"use client";

import { Job } from "@/types/job";
import { formatDistanceToNow } from "@/lib/utils";

interface JobCardProps {
  job: Job;
  onClick: () => void;
}

export function JobCard({ job, onClick }: JobCardProps) {
  const timeAgo = formatDistanceToNow(new Date(job.createdAt));

  return (
    <button
      onClick={onClick}
      className="block w-full text-left bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 hover:border-zinc-400 dark:hover:border-zinc-600 hover:shadow-lg transition-all duration-200 group cursor-pointer"
    >
      <div className="flex items-start gap-3">
        <div
          className="w-2 h-2 rounded-full mt-2 shrink-0"
          style={{ backgroundColor: job.category.color }}
        />
        <div className="flex-1 min-w-0">
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
  );
}
