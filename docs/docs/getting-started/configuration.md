# Configuration

Learn how to customize your LLM Council setup.

## Environment Variables

All configuration is done through environment variables in the `.env` file.

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `OPENROUTER_API_KEY` | Your OpenRouter API key | `sk-or-v1-...` |
| `MONGODB_URL` | MongoDB connection string | `mongodb://localhost:27017` |
| `MONGODB_DATABASE` | Database name | `llm_council` |

### Example .env File

```env
# API Keys
OPENROUTER_API_KEY=sk-or-v1-your-key-here

# Database
MONGODB_URL=mongodb://localhost:27017
MONGODB_DATABASE=llm_council

# Optional: Custom model configuration
# See config.py for model setup
```

## Configuring Council Models

The council models are configured in `backend/config.py`.

### Default Configuration

LLM Council uses free-tier models from OpenRouter by default:

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

# Chairman model (Grok 4.1 Fast via OpenRouter)
CHAIRMAN_MODEL = {
    "id": "x-ai/grok-4.1-fast:free",
    "name": "Grok 4.1 Fast",
    "provider": "openrouter"
}
```

### Customizing Models

You can modify the council composition in `backend/config.py`:

```python
# Example: Use paid models for higher quality
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

## Available Models

LLM Council uses OpenRouter, which provides access to many models including free-tier options.

### Free-Tier Models (Default)

| Model | ID | Notes |
|-------|-----|-------|
| NVIDIA Nemotron 9B | `nvidia/nemotron-nano-9b-v2:free` | Fast, efficient |
| NVIDIA Nemotron 12B VL | `nvidia/nemotron-nano-12b-v2-vl:free` | Vision-language capable |
| Gemma 3 27B | `google/gemma-3-27b-it:free` | Google's open model |
| GPT OSS 20B | `openai/gpt-oss-20b:free` | OpenAI open source |
| Grok 4.1 Fast | `x-ai/grok-4.1-fast:free` | Chairman model |

### Paid Models (Higher Quality)

| Model | ID | Best For |
|-------|-----|----------|
| GPT-4o | `openai/gpt-4o` | General purpose |
| Claude 3.5 Sonnet | `anthropic/claude-3.5-sonnet` | Analysis, writing |
| Gemini Pro 1.5 | `google/gemini-pro-1.5` | Long context |

See the full list at [OpenRouter Models](https://openrouter.ai/models).

## CORS Configuration

By default, the API allows requests from:

- `http://localhost:5173` (Vite dev server)
- `http://localhost:3000` (Alternative port)

To add more origins, modify `backend/main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "https://your-production-domain.com",  # Add your domain
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Performance Tuning

### Parallel Requests

By default, all council members are queried in parallel. This is the fastest approach but uses more API credits simultaneously.

### Timeout Settings

You can adjust timeouts in the OpenRouter client configuration if needed for slower models.

## Next Steps

- [How It Works](../concepts/how-it-works.md) - Understand the council process
- [API Reference](../api/overview.md) - Explore all endpoints
