# DocAI — AI-Powered Document Intelligence

**Upload PDFs. Ask questions. Get smart summaries.** DocAI turns your documents into a searchable, chat-enabled knowledge base with RAG-powered answers grounded in your files.

## Highlights

- **PDF Upload & Processing** — Drag-and-drop, 10MB limit, content-hash deduplication, automatic extraction and vector indexing
- **RAG Chat** — Hybrid search (vector + full-text), streaming responses, inline citations, grounded answers
- **7 Summary Types** — Quick overviews, chapter breakdowns, meeting minutes, legal analysis — each cached and regenerable
- **Document Library** — Search, sort, status tracking, PDF viewer (desktop) with mobile download
- **Admin Dashboard** — Platform stats, document management, AI usage analytics (admin-only)
- **Security** — Supabase RLS, rate limiting, auth-protected routes, dark mode

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16 (App Router) · React 19 · TypeScript |
| UI | Tailwind v4 · shadcn/ui · Radix · Motion |
| Backend | Supabase (Postgres, Auth, Storage, RLS) |
| AI | OpenAI (gpt-4o, gpt-4o-mini, text-embedding-3-large) |
| Hosting | Vercel |

## Quick Start

```bash
git clone https://github.com/OfirPatish/DocAI.git
cd DocAI
npm install
cp .env.local.example .env.local   # add Supabase + OpenAI keys
npm run dev
```

**Prereqs:** Node 18+, Supabase project, OpenAI API key. See [Supabase Setup](./docs/SUPABASE_SETUP.md).

## Project Layout

```
src/
├── app/          Routes (auth, dashboard, API)
├── features/     admin, auth, documents, embed, rag
├── lib/          supabase, openai, pdf, summarize, rate-limit
└── components/   layout, ui (shadcn)
```

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run check` | ESLint + TypeScript |

## Docs

| Doc | Content |
|-----|---------|
| [Supabase Setup](./docs/SUPABASE_SETUP.md) | Keys, auth, schema, troubleshooting |
| [Architecture](./docs/ARCHITECTURE.md) | Structure, API routes, conventions |
| [AI & RAG](./docs/AI-PROMPTS.md) | Models, RAG flow, summary types |
| [OpenAI Costs](./docs/OPENAI-USAGE.md) | Usage, rates, optimization |

## License

MIT
