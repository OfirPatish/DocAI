# DocAI

AI-powered document intelligence platform. Upload PDFs, ask questions with RAG-powered chat, and generate structured summaries — all grounded in your actual documents.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) · React 19 · TypeScript |
| Styling | Tailwind CSS v4 · shadcn/ui · Radix UI · Motion |
| Backend | Supabase (Postgres, Auth, Storage, RLS, RPCs) |
| AI | OpenAI (gpt-4o, gpt-4o-mini, text-embedding-3-large) |
| Hosting | Vercel |

## Features

- **PDF Upload** — Drag-and-drop with 10MB limit, content-hash deduplication, automatic processing pipeline
- **RAG Chat** — Hybrid search (vector + full-text), reciprocal rank fusion, streaming responses with inline citations
- **7 Summary Types** — From quick overviews (gpt-4o-mini) to legal analysis and meeting minutes (gpt-4o), cached per document
- **Document Library** — Search, sort, status tracking, PDF viewer (desktop) with mobile download fallback
- **Admin Dashboard** — Platform-wide stats, document management, AI usage analytics, model breakdown (admin-only)
- **Security** — Row-level security, rate limiting (Supabase-backed), UUID validation, input sanitization, no error leakage
- **Auth** — Email sign-up/sign-in via Supabase Auth, protected routes with middleware
- **Dark Mode** — System-aware theme with manual toggle

## Getting Started

```bash
git clone https://github.com/OfirPatish/DocAI.git
cd DocAI
npm install
cp .env.local.example .env.local   # fill in your keys
npm run dev
```

### Prerequisites

- Node.js 18+
- [Supabase](https://supabase.com) project (free tier works)
- [OpenAI](https://platform.openai.com) API key

### Environment Variables

Copy `.env.local.example` and fill in your credentials. See [Supabase Setup](./docs/SUPABASE-SETUP.md) for details.

### Database Setup

Run the migration SQL in Supabase SQL Editor or use the CLI:

```bash
npx supabase link --project-ref YOUR_REF
npx supabase db push
```

Verify with `supabase/migrations/20240218100000_verify_schema.sql` — passes silently if correct.

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run check` | ESLint + TypeScript checks |
| `npx supabase db push` | Run migrations |

## Documentation

| Doc | Description |
|-----|-------------|
| [Architecture](./docs/ARCHITECTURE.md) | Project structure, conventions, API routes |
| [AI & RAG Pipeline](./docs/AI-PROMPTS.md) | Models, RAG flow, summary types, prompt design |
| [Supabase Setup](./docs/SUPABASE-SETUP.md) | Database setup, schema, troubleshooting |
| [OpenAI Usage & Costs](./docs/OPENAI-USAGE.md) | Cost estimates, rate limits, optimization |

## License

[MIT](./LICENSE)
