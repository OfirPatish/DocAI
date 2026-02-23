# Supabase Setup

## 1. API Keys

**Settings → API**

- Project URL → `NEXT_PUBLIC_SUPABASE_URL`
- Publishable key → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- Secret key → `SUPABASE_SERVICE_ROLE_KEY` (prefer `sb_secret_...` over legacy `service_role`)

## 2. Auth URLs

**Authentication → URL Configuration**

- Site URL: `https://opdev-docai.vercel.app` (prod)
- Redirect URLs: add `https://opdev-docai.vercel.app/auth/callback`, `http://localhost:3000/auth/callback`, `http://localhost:3000/**`

## 3. Storage

Created by schema migration. No manual setup.

## 4. Database

Run `supabase/migrations/20240215140000_docai_schema.sql` in SQL Editor (or `npx supabase db push`). Verify with `20240218100000_verify_schema.sql`.

## 5. Admin Access

```sql
INSERT INTO public.admin_users (user_id) VALUES ('your-user-uuid');
```

## Env Vars

| Variable | Required |
|----------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes |
| `OPENAI_API_KEY` | Yes |
| `NEXT_PUBLIC_APP_URL` | Optional |
