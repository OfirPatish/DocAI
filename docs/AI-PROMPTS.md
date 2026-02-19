# AI & RAG Pipeline

## Models

| Model | Use |
|-------|-----|
| text-embedding-3-large | Chunk embeddings (2000 dims) |
| gpt-4o-mini | Chat, query reformulation, simple summaries |
| gpt-4o | Legal, meeting, chapters, core summaries |

## RAG Flow

```
Query → Reformulate → Hybrid search (vector + full-text) → Rerank top 8 → Stream answer with citations
```

- Dynamic similarity threshold
- Top 16 → rerank to 8, ~400K context chars

## Summary Types

| Type | Model |
|------|-------|
| Summary, Smart, Key Insights | gpt-4o-mini |
| Chapter, Core Points, Meeting, Legal | gpt-4o |

Summaries are cached per (document, type). Each type uses a title like "Smart Summary of the PDF File" as the first heading.

**Regenerating:** Selecting the same summary type again (e.g. Smart Summary when Smart Summary is already shown) triggers regeneration instead of serving the cache. Alternatively, use the Regenerate button to refresh the current summary.
