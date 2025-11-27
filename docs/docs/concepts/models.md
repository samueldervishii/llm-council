# Models

Understanding and configuring the LLM models in your council.

## Model Roles

LLM Council uses two types of model roles:

### Council Members

These are the LLMs that:

- Respond to user questions
- Review each other's responses
- Provide diverse perspectives

**Recommended:** 3-5 models for good diversity without excessive cost.

### Chairman

The chairman is a single LLM responsible for:

- Analyzing all council responses
- Considering peer review feedback
- Producing the final synthesized answer

**Recommended:** Use a capable model like Grok 4.1 Fast for synthesis.

## Choosing Models

### Diversity is Key

Select models with different:

- **Training approaches** (different companies)
- **Strengths** (coding, analysis, creativity)
- **Perspectives** (different knowledge cutoffs)

### Default Configuration (Free Tier)

LLM Council uses free-tier models by default for zero-cost operation:

```python
COUNCIL_MODELS = [
    {
        "id": "nvidia/nemotron-nano-9b-v2:free",
        "name": "NVIDIA Nemotron 9B",
        "provider": "openrouter"
    },
    {
        "id": "nvidia/nemotron-nano-12b-v2-vl:free",
        "name": "NVIDIA: Nemotron Nano 12B 2 VL",
        "provider": "openrouter"
    },
    {
        "id": "google/gemma-3-27b-it:free",
        "name": "Gemma 3 27B",
        "provider": "openrouter"
    },
    {
        "id": "openai/gpt-oss-20b:free",
        "name": "GPT OSS 20B",
        "provider": "openrouter"
    },
]

CHAIRMAN_MODEL = {
    "id": "x-ai/grok-4.1-fast:free",
    "name": "Grok 4.1 Fast",
    "provider": "openrouter"
}
```

### Alternative: Premium Models

For higher quality responses, you can use paid models:

```python
COUNCIL_MODELS = [
    {"id": "openai/gpt-4o", "name": "GPT-4o", "provider": "openrouter"},
    {"id": "anthropic/claude-3.5-sonnet", "name": "Claude 3.5", "provider": "openrouter"},
    {"id": "google/gemini-pro-1.5", "name": "Gemini Pro", "provider": "openrouter"},
]

CHAIRMAN_MODEL = {
    "id": "anthropic/claude-3.5-sonnet",
    "name": "Claude 3.5 Sonnet (Chairman)",
    "provider": "openrouter"
}
```

## Current Models

### Council Members

| Model | ID | Provider | Notes |
| ----- | -- | -------- | ----- |
| **NVIDIA Nemotron 9B** | `nvidia/nemotron-nano-9b-v2:free` | NVIDIA | Fast, efficient |
| **NVIDIA Nemotron 12B VL** | `nvidia/nemotron-nano-12b-v2-vl:free` | NVIDIA | Vision-language capable |
| **Gemma 3 27B** | `google/gemma-3-27b-it:free` | Google | Strong reasoning |
| **GPT OSS 20B** | `openai/gpt-oss-20b:free` | OpenAI | Open source variant |

### Chairman

| Model | ID | Provider | Notes |
| ----- | -- | -------- | ----- |
| **Grok 4.1 Fast** | `x-ai/grok-4.1-fast:free` | xAI | Fast synthesis |

## Cost Considerations

With free-tier models, LLM Council operates at **zero cost**!

For paid models, the cost calculation is:

```
Cost per query ≈
    (Council Members × 2) + 1

    - Each member responds once
    - Each member reviews once
    - Chairman synthesizes once
```

### Example Cost Calculation

With 4 council members + 1 chairman:

| Phase        | API Calls | Models Used     |
| ------------ | --------- | --------------- |
| Responses    | 4         | Council members |
| Peer Reviews | 4         | Council members |
| Synthesis    | 1         | Chairman        |
| **Total**    | **9**     |                 |

!!! tip "Free Tier Advantage"
    Using the default free-tier models means unlimited queries at no cost. Perfect for development, testing, and personal use!

## Viewing Current Configuration

Check your current models via the API:

```bash
curl http://localhost:8000/models | jq
```

Response:

```json
{
  "council_models": [
    {
      "id": "nvidia/nemotron-nano-9b-v2:free",
      "name": "NVIDIA Nemotron 9B",
      "provider": "openrouter"
    },
    {
      "id": "nvidia/nemotron-nano-12b-v2-vl:free",
      "name": "NVIDIA: Nemotron Nano 12B 2 VL",
      "provider": "openrouter"
    },
    {
      "id": "google/gemma-3-27b-it:free",
      "name": "Gemma 3 27B",
      "provider": "openrouter"
    },
    {
      "id": "openai/gpt-oss-20b:free",
      "name": "GPT OSS 20B",
      "provider": "openrouter"
    }
  ],
  "chairman_model": {
    "id": "x-ai/grok-4.1-fast:free",
    "name": "Grok 4.1 Fast",
    "provider": "openrouter"
  }
}
```

## Next Steps

- [Configuration](../getting-started/configuration.md) - How to change models
- [API Reference](../api/models.md) - Models API endpoint
