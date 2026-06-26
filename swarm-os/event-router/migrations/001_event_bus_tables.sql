-- AWOS Agent Event Router — Supabase Migration
-- Version: 1.0 | Staging-only until approved
-- Run ONLY on staging branch first. Never directly on production.

BEGIN;

-- rag_embeddings (verify/create if missing)
CREATE TABLE IF NOT EXISTS public.rag_embeddings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  chunk_id uuid REFERENCES public.rag_chunks(id) ON DELETE CASCADE,
  doc_id text REFERENCES public.rag_documents(doc_id) ON DELETE CASCADE,
  model text DEFAULT 'text-embedding-3-small',
  embedding vector(1536),
  namespace text DEFAULT 'general',
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_re_embedding 
  ON public.rag_embeddings USING ivfflat(embedding vector_cosine_ops) WITH (lists=50);
ALTER TABLE public.rag_embeddings ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='rag_embeddings' AND policyname='rag_embeddings_open') THEN
    CREATE POLICY rag_embeddings_open ON public.rag_embeddings FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Verify all event bus tables exist (created by Base44 APEX)
DO $$ 
DECLARE
  missing_tables text[] := '{}';
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['agent_inbox','agent_outbox','event_schema_registry',
    'agent_messages','bridge_tasks','bridge_receipts','swarm_approvals',
    'agent_memory','swarm_heartbeats','rag_documents','rag_chunks']
  LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename=t) THEN
      missing_tables := array_append(missing_tables, t);
    END IF;
  END LOOP;
  IF array_length(missing_tables,1) > 0 THEN
    RAISE EXCEPTION 'Missing tables: % — run APEX setup first', missing_tables::text;
  END IF;
  RAISE NOTICE 'All event bus tables verified ✅';
END $$;

-- match_documents RPC function for semantic search
CREATE OR REPLACE FUNCTION public.match_documents(
  query_embedding vector(1536),
  match_count int DEFAULT 5,
  namespace_filter text DEFAULT NULL
) 
RETURNS TABLE (
  chunk_id uuid,
  doc_id text,
  chunk_text text,
  similarity float,
  source_ref text,
  namespace text
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    rc.id as chunk_id,
    rc.doc_id,
    rc.chunk_text,
    1 - (rc.embedding <=> query_embedding) as similarity,
    rd.source_ref,
    COALESCE(namespace_filter, 'general') as namespace
  FROM public.rag_chunks rc
  JOIN public.rag_documents rd ON rd.doc_id = rc.doc_id
  WHERE rc.embedding IS NOT NULL
    AND (namespace_filter IS NULL OR rd.tags && ARRAY[namespace_filter])
  ORDER BY rc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

COMMIT;
