# Architecture

## Structure

```
src/
├── app/           Auth, dashboard (documents, admin, settings), API routes
├── features/      admin, auth, documents, embed, rag
├── components/    layout (dashboard-sidebar, dashboard-layout), ui (shadcn)
└── lib/           supabase, openai, pdf, summarize, rate-limit
```

## API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/documents/upload` | POST | Upload PDF |
| `/api/documents/[id]` | PATCH/DELETE | Rename, delete |
| `/api/documents/[id]/process` | POST | Extract, chunk, embed |
| `/api/documents/[id]/chat` | POST | RAG chat (streaming) |
| `/api/documents/[id]/summarize` | POST | Generate/cache summary |
| `/api/documents/[id]/view` | GET | Signed PDF URL |
| `/api/admin/*` | GET | Stats, documents, usage (admin) |

## Conventions

- Feature-based structure, `@/` alias
- Server Components by default, `"use client"` when needed
- shadcn/ui (new-york), kebab-case filenames
