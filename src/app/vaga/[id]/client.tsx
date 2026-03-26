"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";

export function JobDetailClient({ body }: { body: string }) {
  if (!body) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400 italic">
        Sem descrição disponível.
      </p>
    );
  }

  return (
    <div className="prose prose-sm dark:prose-invert prose-zinc max-w-none prose-a:text-blue-500 prose-a:no-underline hover:prose-a:underline prose-pre:bg-zinc-100 dark:prose-pre:bg-zinc-800 prose-code:text-sm">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
        {body}
      </ReactMarkdown>
    </div>
  );
}
