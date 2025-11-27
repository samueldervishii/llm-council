# Sessions API

Complete reference for session management endpoints.

## List Sessions

Retrieve all council sessions.

```
GET /sessions
```

### Parameters

| Name    | Type    | Default | Description                |
| ------- | ------- | ------- | -------------------------- |
| `limit` | integer | 50      | Maximum sessions to return |

### Response

```json
{
  "sessions": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "API Design Best Practices",
      "question": "What are API design best practices?",
      "status": "synthesized",
      "round_count": 2,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "count": 1
}
```

### Example

#### Python

```python
  import requests

  response = requests.get("http://localhost:8000/sessions")
  sessions = response.json()["sessions"]

  for session in sessions:
      print(f"{session['title']} - {session['status']}")
```

#### cURL

```bash
  curl http://localhost:8000/sessions
```

---

## Create Session

Start a new council session with a question.

```
POST /session
```

### Request Body

```json
{
  "question": "What are the best practices for error handling?"
}
```

| Field      | Type   | Required | Description                     |
| ---------- | ------ | -------- | ------------------------------- |
| `question` | string | Yes      | The question to ask the council |

### Response

```json
{
  "session": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "What are the best practices for error handling?",
    "rounds": [
      {
        "question": "What are the best practices for error handling?",
        "responses": [],
        "peer_reviews": [],
        "final_synthesis": null,
        "status": "pending"
      }
    ],
    "is_deleted": false,
    "deleted_at": null
  },
  "message": "Session created. Call /session/{id}/responses to get council responses."
}
```

### Example

#### Python

```python
  import requests

  response = requests.post(
      "http://localhost:8000/session",
      json={"question": "What is machine learning?"}
  )

  session_id = response.json()["session"]["id"]
  print(f"Created session: {session_id}")
```

#### cURL

```bash
  curl -X POST http://localhost:8000/session \
    -H "Content-Type: application/json" \
    -d '{"question": "What is machine learning?"}'
```

---

## Get Session

Retrieve a session by ID.

```
GET /session/{session_id}
```

### Path Parameters

| Name         | Type   | Description      |
| ------------ | ------ | ---------------- |
| `session_id` | string | The session UUID |

### Response

Returns the full session object with all rounds, responses, and reviews.

### Example

#### Python

```python
  import requests

  session_id = "550e8400-e29b-41d4-a716-446655440000"
  response = requests.get(f"http://localhost:8000/session/{session_id}")

  session = response.json()["session"]
  print(f"Status: {session['rounds'][-1]['status']}")
```

#### cURL

```bash
  curl http://localhost:8000/session/550e8400-e29b-41d4-a716-446655440000
```

---

## Delete Session

Soft-delete a session.

```
DELETE /session/{session_id}
```

### Response

```json
{
  "message": "Session deleted"
}
```

---

## Continue Session

Add a follow-up question to an existing session.

```
POST /session/{session_id}/continue
```

!!! warning "Prerequisite"
The previous round must be fully completed (status: `synthesized`) before continuing.

### Request Body

```json
{
  "question": "Can you provide specific examples?"
}
```

### Response

Returns the updated session with a new pending round.

### Example

```python
import requests

session_id = "550e8400-e29b-41d4-a716-446655440000"

# Add follow-up question
response = requests.post(
    f"http://localhost:8000/session/{session_id}/continue",
    json={"question": "Can you elaborate on point 2?"}
)

# Run the council for the new round
result = requests.post(f"http://localhost:8000/session/{session_id}/run-all")
```

---

## Collect Responses

Query all council members for their responses.

```
POST /session/{session_id}/responses
```

**Step 1 of 3** in the council process.

### Response

Returns the session with updated responses in the current round.

```json
{
  "session": {
    "rounds": [
      {
        "status": "responses_complete",
        "responses": [
          {
            "model_id": "openai/gpt-4o",
            "model_name": "GPT-4o",
            "response": "Here are my thoughts...",
            "error": null
          }
          // ... more responses
        ]
      }
    ]
  },
  "message": "All council responses collected. Call /session/{id}/reviews for peer reviews."
}
```

---

## Collect Reviews

Have each council member review and rank others' responses.

```
POST /session/{session_id}/reviews
```

**Step 2 of 3** in the council process.

!!! warning "Prerequisite"
Responses must be collected first (status: `responses_complete`).

### Response

Returns the session with peer reviews added.

```json
{
  "session": {
    "rounds": [
      {
        "status": "reviews_complete",
        "peer_reviews": [
          {
            "reviewer_model": "openai/gpt-4o",
            "rankings": [
              {
                "model_id": "anthropic/claude-3.5-sonnet",
                "rank": 1,
                "score": 8.5
              },
              { "model_id": "google/gemini-pro-1.5", "rank": 2, "score": 7.0 }
            ]
          }
        ]
      }
    ]
  },
  "message": "Peer reviews complete. Call /session/{id}/synthesize for final answer."
}
```

---

## Synthesize

Have the chairman produce the final synthesized answer.

```
POST /session/{session_id}/synthesize
```

**Step 3 of 3** in the council process.

### Response

```json
{
  "session": {
    "rounds": [
      {
        "status": "synthesized",
        "final_synthesis": "Based on the council's deliberation, here is a comprehensive answer..."
      }
    ]
  },
  "message": "Synthesis complete!"
}
```

---

## Run Full Process

Execute the complete council deliberation in one call.

```
POST /session/{session_id}/run-all
```

!!! success "Recommended"
This is the recommended endpoint for most use cases. It runs all three phases automatically.

### What It Does

1. Collects responses from all council members
2. Gathers peer reviews
3. Produces the final synthesis

### Response

Returns the fully completed session.

### Example

#### Python

```python
  import requests

  # Create and run in two calls
  session = requests.post(
      "http://localhost:8000/session",
      json={"question": "What is quantum computing?"}
  ).json()

  result = requests.post(
      f"http://localhost:8000/session/{session['session']['id']}/run-all"
  ).json()

  # Get the final answer
  final_answer = result["session"]["rounds"][0]["final_synthesis"]
  print(final_answer)
```

#### cURL

```bash
  # Create session
  SESSION_ID=$(curl -s -X POST http://localhost:8000/session \
    -H "Content-Type: application/json" \
    -d '{"question": "What is quantum computing?"}' | jq -r '.session.id')

  # Run full process
  curl -X POST "http://localhost:8000/session/$SESSION_ID/run-all" | jq '.session.rounds[0].final_synthesis'
```

## Session Status Reference

| Status               | Description             | Next Step                |
| -------------------- | ----------------------- | ------------------------ |
| `pending`            | Waiting for responses   | Call `/responses`        |
| `responses_complete` | All responses collected | Call `/reviews`          |
| `reviews_complete`   | Peer reviews done       | Call `/synthesize`       |
| `synthesized`        | Process complete        | Call `/continue` or done |
