# API Overview

The LLM Council REST API allows you to programmatically interact with the council.

## Base URL

```
http://localhost:8000
```

## Authentication

Currently, the API does not require authentication. This will be added in a future release.

## Response Format

All responses are JSON formatted.

### Success Response

```json
{
  "session": { ... },
  "message": "Operation completed successfully"
}
```

### Error Response

```json
{
  "detail": "Error description"
}
```

## HTTP Status Codes

| Code | Description |
|------|-------------|
| `200` | Success |
| `400` | Bad request (invalid input) |
| `404` | Resource not found |
| `500` | Internal server error |

## Endpoints Summary

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Health check |

### Sessions

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/sessions` | List all sessions |
| `POST` | `/session` | Create new session |
| `GET` | `/session/{id}` | Get session details |
| `DELETE` | `/session/{id}` | Delete session |
| `POST` | `/session/{id}/continue` | Continue with follow-up |
| `POST` | `/session/{id}/responses` | Collect council responses |
| `POST` | `/session/{id}/reviews` | Collect peer reviews |
| `POST` | `/session/{id}/synthesize` | Get final synthesis |
| `POST` | `/session/{id}/run-all` | Run full process |

### Models

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/models` | Get configured models |

## Quick Start Example

```python
import requests

BASE = "http://localhost:8000"

# 1. Create a session
resp = requests.post(f"{BASE}/session", json={"question": "What is Python?"})
session_id = resp.json()["session"]["id"]

# 2. Run the full council
result = requests.post(f"{BASE}/session/{session_id}/run-all")

# 3. Get the answer
answer = result.json()["session"]["rounds"][0]["final_synthesis"]
print(answer)
```

## Interactive Documentation

The API provides interactive documentation:

- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)

## Next Steps

- [Sessions API](sessions.md) - Detailed session endpoints
- [Models API](models.md) - Models endpoint reference
