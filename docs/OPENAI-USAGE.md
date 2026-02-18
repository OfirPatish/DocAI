# OpenAI Usage & Cost Estimates

Approximate costs — check [OpenAI Pricing](https://platform.openai.com/docs/pricing) for current rates.

## Models

| Model | Purpose | Price (per 1M tokens) |
|-------|---------|----------------------|
| text-embedding-3-large | Chunk embeddings (2000 dims) | $0.13 input |
| gpt-4o-mini | Chat, reformulation, simple summaries | $0.15 in / $0.60 out |
| gpt-4o | Legal, meeting, chapters, core summaries | ~$2.50 in / ~$10 out |

## Cost Per Operation

| Operation | Model | Est. Cost |
|-----------|-------|-----------|
| Process 20-page PDF (~30 chunks) | text-embedding-3-large | ~$0.013 |
| Simple summary (summary/smart/insights) | gpt-4o-mini | $0.003–0.015 |
| Complex summary (legal/meeting/chapters/core) | gpt-4o | $0.05–0.15 |
| Chat message (reformulate + RAG answer) | gpt-4o-mini | $0.001–0.003 |

## Monthly Estimates

| Usage | Docs | Summaries | Chats | Est. Cost |
|-------|------|-----------|-------|-----------|
| Light | 5 | 10 | 50 | $0.50–1 |
| Medium | 20 | 40 | 200 | $2–5 |
| Heavy | 100 | 150 | 1,000 | $15–40 |

## Rate Limits

| Endpoint | Limit |
|----------|-------|
| Chat | 30/min per user |
| Summarize | 10/min per user |
| Upload | 10/min per user |
| Process | 5/min per user |

## Cost Optimization

- **Cached summaries** — same (document, type) pair returns cached result instantly
- **Tiered models** — simple summaries use gpt-4o-mini, only complex types use gpt-4o
- **Adaptive chunking** — heading-aware splitting reduces unnecessary chunks
- **Content-hash dedup** — prevents duplicate processing of identical files
