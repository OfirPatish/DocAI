# DocAI

AI-powered document intelligence. Upload PDFs, ask questions, get smart summaries. RAG-powered answers grounded in your files. Next.js, Supabase, OpenAI.

**Live:** [opdev-docai.vercel.app](https://opdev-docai.vercel.app)  
**GitHub:** [github.com/OfirPatish/DocAI](https://github.com/OfirPatish/DocAI)

## Highlights

- **PDF upload & processing** — Drag-and-drop, 10MB limit, content-hash deduplication, vector indexing
- **RAG chat** — Hybrid search, streaming responses, inline citations, grounded answers
- **7 summary types** — Overviews, chapters, meeting minutes, legal analysis — cached and regenerable
- **Document library** — Search, sort, status, inline PDF viewer, mobile download
- **Admin dashboard** — Platform stats, document management, AI usage (admin-only)
- **Sidebar layout** — Documents, Settings, Admin; theme toggle, responsive
- **Security** — Supabase RLS, rate limiting, auth-protected routes, dark mode

## Stack

Next.js 16 · React 19 · TypeScript · Tailwind v4 · shadcn/ui · Radix · Motion · Supabase · OpenAI

## Quick start

1. **Clone & install** — `git clone https://github.com/OfirPatish/DocAI.git && cd DocAI && npm install`
2. **Env** — `cp .env.local.example .env.local` (add Supabase + OpenAI keys)
3. **Supabase** — Node 18+, Supabase project, OpenAI key. See [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md)
4. **Run** — `npm run dev` → [http://localhost:3000](http://localhost:3000)

## Commands

| Command | Description |
| ------- | ----------- |
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run check` | ESLint + TypeScript |

## Project structure

```
src/
├── app/          Routes (auth, dashboard, API)
├── features/     admin, auth, documents, embed, rag
├── lib/          supabase, openai, pdf, summarize, rate-limit
└── components/   layout, ui (shadcn)
```

## Docs

| Doc | Purpose |
| --- | ------- |
| [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md) | Keys, auth, schema, troubleshooting |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Structure, API routes, conventions |
| [docs/AI-PROMPTS.md](docs/AI-PROMPTS.md) | Models, RAG flow, summary types |
| [docs/OPENAI-USAGE.md](docs/OPENAI-USAGE.md) | Usage, rates, optimization |

---

**License:** MIT
