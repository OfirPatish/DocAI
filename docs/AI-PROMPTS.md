# AI & RAG Pipeline

## Models

| Model | Purpose | Temp |
|-------|---------|------|
| **text-embedding-3-large** | Chunk embeddings (2000 dims, HNSW index) | — |
| **gpt-4o-mini** | Chat, query reformulation, simple summaries | 0.1–0.2 |
| **gpt-4o** | Legal, meeting, chapters, core summaries | 0.3 |

## RAG Flow

```
User query → Reformulate (fix typos, expand terms)
           → Hybrid search (vector similarity + full-text tsvector, merged via RRF)
           → Rerank top 8 (65% vector score, 25% keyword overlap, 10% position)
           → Generate answer (streaming NDJSON with inline citations)
```

- **Dynamic similarity threshold** based on score distribution (not a fixed cutoff)
- **Anti-injection** instruction in system prompt
- **Context window:** topK 16 → rerank to 8, MAX_CONTEXT_CHARS 400K

## Summary Types

| Type | Model | Description |
|------|-------|-------------|
| Summary | gpt-4o-mini | Full overview with highlights and takeaways |
| Smart | gpt-4o-mini | Best-format presentation (tables, lists, sections) |
| Key Insights | gpt-4o-mini | Scannable highlights for fast catch-up |
| Chapter | gpt-4o | Organized by document sections |
| Core Points | gpt-4o | Executive-level takeaways |
| Meeting Minutes | gpt-4o | Outcomes and action items |
| Legal / Contract | gpt-4o | Terms, obligations, risks, important clauses |

Summaries are cached per (document, type). Cached results are returned instantly; regeneration is opt-in.

## Response Style

Courteous opener, clear hierarchy (## / ### / ####), numbered sections, substantive bullet points, tables for comparisons, inline citations [1][2] with a References section at the end.
