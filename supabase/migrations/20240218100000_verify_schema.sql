-- DocAI — Schema verification
-- Run in Supabase SQL Editor. Completes silently if all checks pass; raises error with message if not.
-- Does not modify data.

do $$
declare
  v_missing text[] := array[]::text[];
  v_msg text;
begin
  -- Tables
  if not exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'documents') then
    v_missing := array_append(v_missing, 'table: documents');
  end if;
  if not exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'document_chunks') then
    v_missing := array_append(v_missing, 'table: document_chunks');
  end if;
  if not exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'summaries') then
    v_missing := array_append(v_missing, 'table: summaries');
  end if;
  if not exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'ai_usage_log') then
    v_missing := array_append(v_missing, 'table: ai_usage_log');
  end if;
  if not exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'rate_limit_entries') then
    v_missing := array_append(v_missing, 'table: rate_limit_entries');
  end if;
  if not exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'admin_users') then
    v_missing := array_append(v_missing, 'table: admin_users');
  end if;

  -- documents columns
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'documents' and column_name = 'content_hash') then
    v_missing := array_append(v_missing, 'documents.content_hash');
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'documents' and column_name = 'processing_progress') then
    v_missing := array_append(v_missing, 'documents.processing_progress');
  end if;

  -- document_chunks columns
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'document_chunks' and column_name = 'content_search') then
    v_missing := array_append(v_missing, 'document_chunks.content_search');
  end if;

  -- RPCs
  if not exists (select 1 from pg_proc p join pg_namespace n on p.pronamespace = n.oid where n.nspname = 'public' and p.proname = 'get_document_chunk_stats') then
    v_missing := array_append(v_missing, 'RPC: get_document_chunk_stats');
  end if;
  if not exists (select 1 from pg_proc p join pg_namespace n on p.pronamespace = n.oid where n.nspname = 'public' and p.proname = 'match_document_chunks') then
    v_missing := array_append(v_missing, 'RPC: match_document_chunks');
  end if;
  if not exists (select 1 from pg_proc p join pg_namespace n on p.pronamespace = n.oid where n.nspname = 'public' and p.proname = 'search_document_chunks_text') then
    v_missing := array_append(v_missing, 'RPC: search_document_chunks_text');
  end if;
  if not exists (select 1 from pg_proc p join pg_namespace n on p.pronamespace = n.oid where n.nspname = 'public' and p.proname = 'check_rate_limit') then
    v_missing := array_append(v_missing, 'RPC: check_rate_limit');
  end if;
  if not exists (select 1 from pg_proc p join pg_namespace n on p.pronamespace = n.oid where n.nspname = 'public' and p.proname = 'is_admin') then
    v_missing := array_append(v_missing, 'RPC: is_admin');
  end if;

  -- HNSW index
  if not exists (select 1 from pg_indexes where schemaname = 'public' and indexname = 'document_chunks_embedding_hnsw_idx') then
    v_missing := array_append(v_missing, 'index: document_chunks_embedding_hnsw_idx');
  end if;

  if array_length(v_missing, 1) > 0 then
    v_msg := 'Schema verification failed. Missing: ' || array_to_string(v_missing, ', ');
    raise exception '%', v_msg;
  end if;

  raise notice 'DocAI schema verification passed.';
end;
$$;
