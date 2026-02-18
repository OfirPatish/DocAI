# Supabase Setup

## Steps

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **Settings → API** — copy Project URL, publishable key, and service_role key
3. `cp .env.local.example .env.local` and fill in the keys
4. **Authentication → Providers** → Enable **Email**
5. Run the schema migration:
   - **Option A:** Paste `supabase/migrations/20240215140000_docai_schema.sql` into the SQL Editor
   - **Option B:** `npx supabase link --project-ref YOUR_REF` then `npx supabase db push`
6. Verify: Run `supabase/migrations/20240218100000_verify_schema.sql` in SQL Editor — passes silently if correct, raises an error listing what's missing

## Schema

| Table | Purpose |
|-------|---------|
| `documents` | User documents (filename, status, progress, content hash) |
| `document_chunks` | Chunked text with vector embeddings (2000 dims) + tsvector |
| `summaries` | Cached summaries per (document, type) |
| `ai_usage_log` | Token usage tracking per API call |
| `rate_limit_entries` | Postgres-backed rate limiting |
| `admin_users` | Admin whitelist (user_id → auth.users) |

## Grant Admin Access

```sql
INSERT INTO public.admin_users (user_id) VALUES ('your-user-uuid-here');
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Missing env vars | `.env.local` needs `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY` |
| Auth not working | Enable Email provider in Supabase dashboard |
| Schema errors | Re-run the migration SQL, then run the verify script |
