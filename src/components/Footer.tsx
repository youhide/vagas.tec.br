import { CATEGORIES } from "@/lib/categories";

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Feito com 💜 pela comunidade brasileira de tecnologia
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-2">
              Vagas coletadas dos repositórios das comunidades:
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-1.5 mt-2">
              {CATEGORIES.map((category) => (
                <a
                  key={category.id}
                  href={`https://github.com/${category.owner}/${category.repo}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={`${category.owner}/${category.repo}`}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-blue-500 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                >
                  <span aria-hidden="true">{category.emoji}</span>
                  <span>{category.name}</span>
                </a>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://github.com/sponsors/youhide"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 hover:bg-pink-200 dark:hover:bg-pink-900/50 transition-colors text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              Apoie o projeto
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
