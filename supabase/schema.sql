-- Criar tabela para cache das vagas
-- Execute isso no SQL Editor do Supabase

CREATE TABLE IF NOT EXISTS jobs_cache (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar index para buscas mais rápidas
CREATE INDEX IF NOT EXISTS idx_jobs_cache_updated_at ON jobs_cache(updated_at);

-- Habilitar Row Level Security (RLS)
ALTER TABLE jobs_cache ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura pública (anon key pode ler)
CREATE POLICY "Allow public read access" ON jobs_cache
  FOR SELECT
  USING (true);

-- Política para permitir insert/update com anon key
-- Nota: Em produção, você pode querer usar service_role key para writes
CREATE POLICY "Allow public insert" ON jobs_cache
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update" ON jobs_cache
  FOR UPDATE
  USING (true)
  WITH CHECK (true);
