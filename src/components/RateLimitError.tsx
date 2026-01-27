interface RateLimitErrorProps {
  resetTime: Date;
}

export function RateLimitError({ resetTime }: RateLimitErrorProps) {
  const resetTimeStr = resetTime.toLocaleString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-6 text-center">
      <div className="text-4xl mb-4">⚠️</div>
      <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200 mb-2">
        Limite de requisições do GitHub atingido
      </h3>
      <p className="text-amber-700 dark:text-amber-300 mb-4">
        Sem um token de API, o GitHub permite apenas 60 requisições por hora.
        <br />O limite será resetado às <strong>{resetTimeStr}</strong>.
      </p>
      <div className="space-y-2 text-sm text-amber-600 dark:text-amber-400">
        <p>💡 Dica para desenvolvedores:</p>
        <p>
          Adicione um{" "}
          <code className="bg-amber-100 dark:bg-amber-900 px-1.5 py-0.5 rounded">
            GITHUB_TOKEN
          </code>{" "}
          no arquivo{" "}
          <code className="bg-amber-100 dark:bg-amber-900 px-1.5 py-0.5 rounded">
            .env.local
          </code>{" "}
          para 5.000 requisições/hora.
        </p>
      </div>
      <div className="mt-6">
        <a
          href="https://github.com/settings/tokens"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path
              fillRule="evenodd"
              d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              clipRule="evenodd"
            />
          </svg>
          Criar token no GitHub
        </a>
      </div>
    </div>
  );
}
