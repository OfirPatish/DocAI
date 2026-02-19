# OpenAI Usage

Check [OpenAI Pricing](https://platform.openai.com/docs/pricing) for current rates.

## Models

| Model | Price (per 1M tokens) |
|-------|------------------------|
| text-embedding-3-large | $0.13 input |
| gpt-4o-mini | $0.15 in / $0.60 out |
| gpt-4o | ~$2.50 in / ~$10 out |

## Est. Cost

| Operation | Est. |
|-----------|------|
| Process 20-page PDF | ~$0.01 |
| Simple summary | $0.003–0.015 |
| Complex summary | $0.05–0.15 |
| Chat message | $0.001–0.003 |

## Rate Limits

| Endpoint | Limit |
|----------|-------|
| Chat | 30/min |
| Summarize | 10/min |
| Upload | 10/min |
| Process | 5/min |

## Optimization

- Cached summaries (instant for same doc+type)
- Tiered models (simple vs complex)
- Content-hash dedup
