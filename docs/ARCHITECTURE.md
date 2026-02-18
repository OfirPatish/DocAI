# Architecture

## Project Structure

```
src/
├── app/
│   ├── (auth)/           Sign-in, sign-up, forgot-password
│   ├── (dashboard)/      Documents library, document detail, admin dashboard, settings
│   ├── api/
│   │   ├── documents/    Upload, CRUD, process, chat, summarize, view, stats
│   │   └── admin/        Admin check, stats, documents, usage (service role)
│   ├── auth/             OAuth callback
│   ├── privacy/          Privacy policy
│   └── terms/            Terms of service
├── components/
│   ├── layout/           DashboardNav
│   └── ui/               shadcn components (button, card, table, tabs, etc.)
├── features/
│   ├── admin/            Stats cards, documents table, usage table, model breakdown, recent activity
│   ├── auth/             Sign-in/up forms, AuthProvider, useAuth
│   ├── documents/        Upload, library, card, detail, PDF viewer, chat, summary
│   ├── embed/            Text chunking (~800 tokens, heading-aware)
│   └── rag/              Hybrid retrieval (vector + full-text), reranking
├── hooks/                useAdmin
├── lib/
│   ├── admin.ts          Server-side admin check (is_admin RPC + service role)
│   ├── openai/           OpenAI client, embeddings (batch + retry)
│   ├── pdf/              PDF extraction via unpdf
│   ├── query/            Query reformulation for search
│   ├── rate-limit.ts     Supabase-backed rate limiter (in-memory fallback)
│   ├── summarize/        7 summary prompts + tiered model routing
│   ├── supabase/         Server, browser, admin clients + env + types
│   ├── validation.ts     UUID validation
│   └── ai-usage.ts       Token tracking to ai_usage_log
├── providers/            UploadProvider (isBusy state during upload/summary)
└── proxy.ts              Auth middleware, route protection
```

## Conventions

- **Feature-based** structure with barrel exports per feature
- **Kebab-case** filenames, `@/` path alias
- **shadcn/ui** (new-york style) for all UI components
- Server Components by default, `"use client"` only when needed

## API Routes

| Route | Method | Auth | Rate Limit | Purpose |
|-------|--------|------|------------|---------|
| `/api/documents/upload` | POST | User | 10/min | Upload PDF (10MB, content-hash dedup) |
| `/api/documents/[id]` | PATCH | Owner | — | Rename document |
| `/api/documents/[id]` | DELETE | Owner | — | Delete document + storage |
| `/api/documents/[id]/process` | POST | Owner | 5/min | Extract, chunk, embed |
| `/api/documents/[id]/chat` | POST | Owner | 30/min | Streaming RAG chat |
| `/api/documents/[id]/summarize` | POST | Owner | 10/min | Generate/cache summary |
| `/api/documents/[id]/view` | GET | Owner | — | Signed PDF URL (1hr) |
| `/api/documents/[id]/stats` | GET | Owner | — | Chunk count + total chars |
| `/api/admin/check` | GET | User | — | Returns `{ isAdmin }` |
| `/api/admin/stats` | GET | Admin | — | Aggregated platform stats |
| `/api/admin/documents` | GET | Admin | — | All documents (service role) |
| `/api/admin/usage` | GET | Admin | — | AI usage log (service role) |

All `[id]` routes validate UUID format before querying. Error responses use `{ error: string }` consistently.
