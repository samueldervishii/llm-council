# Models API

Reference for the models endpoint.

## Get Models

Retrieve the configured council models and chairman.

```
GET /models
```

### Response

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

### Response Fields

#### council_models

Array of council member models.

| Field      | Type   | Description                             |
| ---------- | ------ | --------------------------------------- |
| `id`       | string | Model identifier used with the provider |
| `name`     | string | Human-readable display name             |
| `provider` | string | The LLM provider (e.g., "openrouter")   |

#### chairman_model

The model responsible for synthesis.

| Field      | Type   | Description      |
| ---------- | ------ | ---------------- |
| `id`       | string | Model identifier |
| `name`     | string | Display name     |
| `provider` | string | The LLM provider |

### Example

#### Python

```python
  import requests

  response = requests.get("http://localhost:8000/models")
  data = response.json()

  print("Council Members:")
  for model in data["council_models"]:
      print(f"  - {model['name']} ({model['id']})")

  print(f"\nChairman: {data['chairman_model']['name']}")
```

#### cURL

```bash
  curl http://localhost:8000/models | jq
```

#### JavaScript

```javascript
const response = await fetch("http://localhost:8000/models");
const data = await response.json();

console.log("Council Members:");
data.council_models.forEach((model) => {
  console.log(`  - ${model.name} (${model.id})`);
});

console.log(`\nChairman: ${data.chairman_model.name}`);
```

### Output

```
Council Members:
  - NVIDIA Nemotron 9B (nvidia/nemotron-nano-9b-v2:free)
  - NVIDIA: Nemotron Nano 12B 2 VL (nvidia/nemotron-nano-12b-v2-vl:free)
  - Gemma 3 27B (google/gemma-3-27b-it:free)
  - GPT OSS 20B (openai/gpt-oss-20b:free)

Chairman: Grok 4.1 Fast
```

## Changing Models

Models are configured in `backend/config.py`. See the [Configuration Guide](../getting-started/configuration.md) for details.

!!! note "Runtime Changes"
Currently, model configuration requires a server restart. Dynamic model configuration is planned for a future release.
