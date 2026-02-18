-- DocAI — Full schema (pgvector, documents, chunks, summaries, admin, Storage, RAG)
-- Includes: text-embedding-3-large (2000 dims, max for HNSW index), hybrid search, progress tracking, content hashing, AI usage, admin users.
-- Run in Supabase Dashboard → SQL Editor, or: npx supabase db push

-- 1. Enable pgvector extension
create extension if not exists vector with schema extensions;

-- 2. documents table
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  filename text not null,
  storage_path text not null,
  file_size bigint,
  page_count int,
  chunk_count int default 0,
  extracted_char_count bigint,
  content_hash text,
  processing_progress int default 0,
  status text default 'pending' check (status in ('pending', 'processing', 'ready', 'error')),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 3. document_chunks table with pgvector (2000 dims — HNSW max; text-embedding-3-large with dimensions=2000)
create table if not exists public.document_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  content text not null,
  chunk_index int not null,
  embedding extensions.vector(2000),
  metadata jsonb default '{}',
  content_search tsvector,
  created_at timestamptz default now() not null
);

-- 4. summaries table (cache for document summaries, supports multiple types)
create table if not exists public.summaries (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  summary_text text not null,
  summary_type text default 'summary',
  created_at timestamptz default now() not null
);

-- 5. ai_usage_log table (token tracking for cost visibility)
create table if not exists public.ai_usage_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  endpoint text not null,
  model text not null,
  prompt_tokens int default 0,
  completion_tokens int default 0,
  total_tokens int default 0,
  document_id uuid references public.documents(id) on delete set null,
  created_at timestamptz default now() not null
);

-- 6. Ensure columns exist (idempotent for existing installs)
alter table public.documents add column if not exists chunk_count int default 0;
alter table public.documents add column if not exists extracted_char_count bigint;
alter table public.documents add column if not exists content_hash text;
alter table public.documents add column if not exists processing_progress int default 0;
alter table public.summaries add column if not exists summary_type text default 'summary';
alter table public.document_chunks add column if not exists content_search tsvector;
-- Upgrade embedding 1536→2000 for existing installs (null existing embeddings first)
update public.document_chunks set embedding = null where embedding is not null;
alter table public.document_chunks alter column embedding type extensions.vector(2000);

-- 7. Indexes
create index if not exists documents_user_id_idx on public.documents(user_id);
create index if not exists documents_created_at_idx on public.documents(created_at desc);
create index if not exists documents_content_hash_idx on public.documents(user_id, content_hash);
create index if not exists document_chunks_document_id_idx on public.document_chunks(document_id);
create index if not exists document_chunks_content_search_idx on public.document_chunks using gin(content_search);
alter table public.summaries drop constraint if exists summaries_document_id_key;
create unique index if not exists summaries_document_id_type_key on public.summaries (document_id, summary_type);
create index if not exists ai_usage_log_user_id_idx on public.ai_usage_log(user_id);
create index if not exists ai_usage_log_created_at_idx on public.ai_usage_log(created_at desc);

-- 8. Full-text search trigger for content_search
create or replace function public.document_chunks_search_trigger()
returns trigger as $$
begin
  new.content_search := to_tsvector('english', new.content);
  return new;
end
$$ language plpgsql;

drop trigger if exists document_chunks_search_update on public.document_chunks;
create trigger document_chunks_search_update
  before insert or update of content on public.document_chunks
  for each row
  execute function public.document_chunks_search_trigger();

-- Backfill tsvector for existing chunks
update public.document_chunks set content_search = to_tsvector('english', content) where content_search is null;

-- 9. Enable RLS
alter table public.documents enable row level security;
alter table public.document_chunks enable row level security;
alter table public.summaries enable row level security;
alter table public.ai_usage_log enable row level security;

-- 10. RLS policies — documents
drop policy if exists "Users can select own documents" on public.documents;
create policy "Users can select own documents" on public.documents for select to authenticated using (auth.uid() = user_id);
drop policy if exists "Users can insert own documents" on public.documents;
create policy "Users can insert own documents" on public.documents for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Users can update own documents" on public.documents;
create policy "Users can update own documents" on public.documents for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Users can delete own documents" on public.documents;
create policy "Users can delete own documents" on public.documents for delete to authenticated using (auth.uid() = user_id);

-- 11. RLS policies — document_chunks
drop policy if exists "Users can select own document chunks" on public.document_chunks;
create policy "Users can select own document chunks" on public.document_chunks for select to authenticated
  using (exists (select 1 from public.documents d where d.id = document_chunks.document_id and d.user_id = auth.uid()));
drop policy if exists "Users can insert chunks for own documents" on public.document_chunks;
create policy "Users can insert chunks for own documents" on public.document_chunks for insert to authenticated
  with check (exists (select 1 from public.documents d where d.id = document_chunks.document_id and d.user_id = auth.uid()));
drop policy if exists "Users can update chunks for own documents" on public.document_chunks;
create policy "Users can update chunks for own documents" on public.document_chunks for update to authenticated
  using (exists (select 1 from public.documents d where d.id = document_chunks.document_id and d.user_id = auth.uid()))
  with check (exists (select 1 from public.documents d where d.id = document_chunks.document_id and d.user_id = auth.uid()));
drop policy if exists "Users can delete chunks for own documents" on public.document_chunks;
create policy "Users can delete chunks for own documents" on public.document_chunks for delete to authenticated
  using (exists (select 1 from public.documents d where d.id = document_chunks.document_id and d.user_id = auth.uid()));

-- 12. RLS policies — summaries
drop policy if exists "Users can select own summaries" on public.summaries;
create policy "Users can select own summaries" on public.summaries for select to authenticated
  using (exists (select 1 from public.documents d where d.id = summaries.document_id and d.user_id = auth.uid()));
drop policy if exists "Users can insert summaries for own documents" on public.summaries;
create policy "Users can insert summaries for own documents" on public.summaries for insert to authenticated
  with check (exists (select 1 from public.documents d where d.id = summaries.document_id and d.user_id = auth.uid()));
drop policy if exists "Users can update summaries for own documents" on public.summaries;
create policy "Users can update summaries for own documents" on public.summaries for update to authenticated
  using (exists (select 1 from public.documents d where d.id = summaries.document_id and d.user_id = auth.uid()))
  with check (exists (select 1 from public.documents d where d.id = summaries.document_id and d.user_id = auth.uid()));
drop policy if exists "Users can delete summaries for own documents" on public.summaries;
create policy "Users can delete summaries for own documents" on public.summaries for delete to authenticated
  using (exists (select 1 from public.documents d where d.id = summaries.document_id and d.user_id = auth.uid()));

-- 13. RLS policies — ai_usage_log
drop policy if exists "Users can view own usage" on public.ai_usage_log;
create policy "Users can view own usage" on public.ai_usage_log for select to authenticated using (auth.uid() = user_id);

-- 14. Storage bucket for PDFs (10MB, PDF only)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('documents', 'documents', false, 10485760, array['application/pdf'])
on conflict (id) do nothing;

-- 15. Storage RLS policies
drop policy if exists "Users can upload to own folder" on storage.objects;
create policy "Users can upload to own folder" on storage.objects for insert to authenticated
  with check (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "Users can read own files" on storage.objects;
create policy "Users can read own files" on storage.objects for select to authenticated
  using (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "Users can update own files" on storage.objects;
create policy "Users can update own files" on storage.objects for update to authenticated
  using (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "Users can delete own files" on storage.objects;
create policy "Users can delete own files" on storage.objects for delete to authenticated
  using (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);

-- 16. get_document_chunk_stats RPC
create or replace function public.get_document_chunk_stats(p_document_id uuid, p_user_id uuid)
returns table (chunk_count bigint, total_chars bigint)
language sql security definer as $$
  select count(*)::bigint, coalesce(sum(length(content)), 0)::bigint
  from public.document_chunks dc
  join public.documents d on d.id = dc.document_id and d.user_id = p_user_id
  where dc.document_id = p_document_id;
$$;

-- 17. match_document_chunks RPC (2000 dims) + HNSW index
drop index if exists public.document_chunks_embedding_hnsw_idx;
drop function if exists public.match_document_chunks(extensions.vector(1536), uuid, uuid, int);
drop function if exists public.match_document_chunks(extensions.vector(3072), uuid, uuid, int);
drop function if exists public.match_document_chunks(extensions.vector(2000), uuid, uuid, int);
create or replace function public.match_document_chunks(
  p_query_embedding extensions.vector(2000),
  p_document_id uuid,
  p_user_id uuid,
  p_match_count int default 5
)
returns table (id uuid, document_id uuid, content text, chunk_index int, metadata jsonb, similarity float)
language sql security definer as $$
  select dc.id, dc.document_id, dc.content, dc.chunk_index, dc.metadata,
    -(dc.embedding <#> p_query_embedding) as similarity
  from public.document_chunks dc
  join public.documents d on d.id = dc.document_id and d.user_id = p_user_id
  where dc.document_id = p_document_id and dc.embedding is not null
  order by dc.embedding <#> p_query_embedding
  limit least(p_match_count, 30);
$$;
create index if not exists document_chunks_embedding_hnsw_idx
  on public.document_chunks using hnsw (embedding vector_ip_ops);

-- 18. search_document_chunks_text RPC (hybrid full-text search)
create or replace function public.search_document_chunks_text(
  p_query text,
  p_document_id uuid,
  p_user_id uuid,
  p_match_count int default 10
)
returns table (id uuid, document_id uuid, content text, chunk_index int, metadata jsonb, rank float)
language sql security definer as $$
  select dc.id, dc.document_id, dc.content, dc.chunk_index, dc.metadata,
    ts_rank_cd(dc.content_search, websearch_to_tsquery('english', p_query)) as rank
  from public.document_chunks dc
  join public.documents d on d.id = dc.document_id and d.user_id = p_user_id
  where dc.document_id = p_document_id
    and dc.content_search @@ websearch_to_tsquery('english', p_query)
  order by rank desc
  limit least(p_match_count, 30);
$$;

-- 19. Admin users (whitelist, service-role-only access)
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz default now() not null
);

alter table public.admin_users enable row level security;

create or replace function public.is_admin(p_user_id uuid)
returns boolean
language sql security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users where user_id = p_user_id
  );
$$;

-- 20. Rate limiting (Supabase-backed, shared across serverless instances)

create table if not exists public.rate_limit_entries (
  key text primary key,
  request_count int not null default 0,
  window_start timestamptz not null
);

-- RLS on rate_limit_entries: no policies = only check_rate_limit (SECURITY DEFINER) can access
alter table public.rate_limit_entries enable row level security;

create or replace function public.check_rate_limit(
  p_key text,
  p_limit int,
  p_window_seconds int default 60
)
returns table (allowed boolean, remaining int, reset_at timestamptz)
language plpgsql security definer
set search_path = public
as $$
declare
  v_now timestamptz := now();
  v_window_start timestamptz;
  v_count int;
  v_new_count int;
begin
  select window_start, request_count into v_window_start, v_count
  from public.rate_limit_entries
  where rate_limit_entries.key = p_key
  for update;

  if not found or (v_now - v_window_start) > (p_window_seconds || ' seconds')::interval then
    v_window_start := v_now;
    v_new_count := 1;
    insert into public.rate_limit_entries (key, request_count, window_start)
    values (p_key, 1, v_window_start)
    on conflict (key) do update set request_count = 1, window_start = v_window_start;
  else
    v_new_count := v_count + 1;
    update public.rate_limit_entries set request_count = v_new_count where key = p_key;
  end if;

  return query select
    v_new_count <= p_limit,
    greatest(0, p_limit - v_new_count),
    v_window_start + (p_window_seconds || ' seconds')::interval;
end;
$$;

-- 21. Invalidate existing embeddings after upgrade (existing installs only)
update public.documents set status = 'pending', processing_progress = 0 where status = 'ready';
