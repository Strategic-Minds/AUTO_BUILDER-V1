-- AWOS Agent Event Router - Supabase Migration
-- Version: 1.1 | Staging-only until approved
-- Run ONLY on a Supabase branch or staging database first. Never directly on production.

BEGIN;

-- rag_embeddings (verify/create if missing)
CREATE TABLE IF NOT EXISTS public.rag_embeddings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  chunk_id uuid REFERENCES public.rag_chunks(id) ON DELETE CASCADE,
  doc_id text REFERENCES public.rag_documents(doc_id) ON DELETE CASCADE,
  model text DEFAULT 'text-embedding-3-small',
  embedding vector(1536) NOT NULL,
  namespace text DEFAULT 'general',
  created_at timestamptz DEFAULT now(),
  CONSTRAINT rag_embeddings_chunk_or_doc_ref CHECK (chunk_id IS NOT NULL OR doc_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_rag_embeddings_embedding
  ON public.rag_embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 50);

CREATE INDEX IF NOT EXISTS idx_rag_embeddings_namespace
  ON public.rag_embeddings (namespace);

ALTER TABLE public.rag_embeddings ENABLE ROW LEVEL SECURITY;

-- Remove the earlier permissive staging policy if it was applied anywhere.
DROP POLICY IF EXISTS rag_embeddings_open ON public.rag_embeddings;
DROP POLICY IF EXISTS rag_embeddings_service_role_all ON public.rag_embeddings;

-- Router writes and semantic lookup should use server-side service-role access.
-- Do not grant anon/authenticated broad access here; add narrower read policies only after review.
CREATE POLICY rag_embeddings_service_role_all
  ON public.rag_embeddings
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Verify all event bus tables exist (created by Base44 APEX / AWOS setup).
-- Use canonical names reported by the live inspection: approval_gate and agent_heartbeats.
DO $$
DECLARE
  missing_tables text[] := '{}';
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'agent_inbox',
    'agent_outbox',
    'event_schema_registry',
    'agent_messages',
    'bridge_tasks',
    'bridge_receipts',
    'approval_gate',
    'agent_memory',
    'agent_heartbeats',
    'rag_documents',
    'rag_chunks'
  ]
  LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = t) THEN
      missing_tables := array_append(missing_tables, t);
    END IF;
  END LOOP;

  IF array_length(missing_tables, 1) > 0 THEN
    RAISE EXCEPTION 'Missing tables: %. Run APEX setup first or apply the canonical event bus migration in staging.', missing_tables::text;
  END IF;

  RAISE NOTICE 'All canonical event bus tables verified';
END $$;

-- match_documents RPC function for semantic search.
-- Query rag_embeddings as the embedding source, then join to chunks/documents for text and source refs.
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
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    rc.id AS chunk_id,
    COALESCE(rc.doc_id, re.doc_id) AS doc_id,
    rc.chunk_text,
    1 - (re.embedding <=> query_embedding) AS similarity,
    rd.source_ref,
    re.namespace
  FROM public.rag_embeddings re
  JOIN public.rag_chunks rc ON rc.id = re.chunk_id
  JOIN public.rag_documents rd ON rd.doc_id = COALESCE(rc.doc_id, re.doc_id)
  WHERE re.embedding IS NOT NULL
    AND (
      namespace_filter IS NULL
      OR re.namespace = namespace_filter
      OR rd.tags && ARRAY[namespace_filter]
    )
  ORDER BY re.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

REVOKE ALL ON FUNCTION public.match_documents(vector, integer, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.match_documents(vector, integer, text) TO service_role;

COMMIT;
