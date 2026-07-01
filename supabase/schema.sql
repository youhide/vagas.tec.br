-- Tabela de vagas (uma linha por issue do GitHub)
-- Execute isso no SQL Editor do Supabase

CREATE TABLE IF NOT EXISTS jobs (
  id BIGINT PRIMARY KEY,                -- GitHub issue id
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  url TEXT NOT NULL,
  labels JSONB NOT NULL DEFAULT '[]',   -- Label[] { name, color }
  category_id TEXT NOT NULL,            -- id em src/lib/categories.ts
  repository TEXT NOT NULL,             -- "owner/repo"
  author TEXT NOT NULL DEFAULT '',
  author_avatar TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL,      -- created_at da issue
  updated_at TIMESTAMPTZ NOT NULL,      -- updated_at da issue
  state TEXT NOT NULL DEFAULT 'open' CHECK (state IN ('open', 'closed')),
  location_type TEXT,                   -- remoto | hibrido | presencial (derivado de labels/título)
  seniority TEXT[],                     -- junior | pleno | senior (derivado de labels/título)
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_detected_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_jobs_open_created ON jobs (created_at DESC) WHERE state = 'open';
CREATE INDEX IF NOT EXISTS idx_jobs_category ON jobs (category_id) WHERE state = 'open';

ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Leitura pública (anon key); escrita somente via service_role key
-- (bypassa RLS automaticamente — nunca expor no client)
CREATE POLICY "Allow public read access" ON jobs
  FOR SELECT
  USING (true);

-- A tabela antiga jobs_cache (blob JSONB único) foi substituída pela tabela
-- jobs acima. Após validar a nova tabela em produção, remova-a com:
--   DROP TABLE IF EXISTS jobs_cache;
