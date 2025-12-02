# Quickstart

Get up and running with LLM Council in 5 minutes.

## Starting the Services

Make sure both backend and frontend are running:

#### "Backend"

```bash
    cd backend
    source venv/bin/activate
    python main.py
```

#### "Frontend"

```bash
    cd frontend
    npm run dev
```

## Using the Web Interface

The easiest way to use LLM Council is through the web interface.

### 1. Open the Chat

Navigate to `http://localhost:5173` in your browser.

### 2. Choose Your Council Mode

Select between two modes:

- **Formal Mode**: Traditional council process with parallel responses, peer reviews, and chairman synthesis
- **Chat Mode**: Group chat style where models respond sequentially and can reply to each other

### 3. Select Your Models

Before asking a question, you can choose which models participate in the council using the model selection panel.

### 4. Ask a Question

Type your question in the input field. Use `Ctrl+Enter` to send.

### 5. Watch the Council Deliberate

The council will:

1. Query all member LLMs (response times displayed for each)
2. Collect peer reviews (formal mode)
3. Synthesize a final answer (formal mode)

### 6. Continue the Conversation

Ask follow-up questions to dive deeper into the topic.

### UI Features

| Feature | Description |
|---------|-------------|
| **Theme Toggle** | Switch between dark and light mode using the sun/moon icon |
| **Copy Response** | Hover over any model response to reveal the copy button |
| **Response Times** | See how long each model took to respond |
| **Pin Sessions** | Pin important chats to keep them at the top of your history |
| **Rename Sessions** | Give sessions custom names for easy reference |
| **Share Sessions** | Generate shareable links for read-only access |
| **Export** | Download sessions as Markdown files |

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Enter` | Send message |
| `Ctrl+N` | New chat |
| `Ctrl+B` | Toggle sidebar |
| `Ctrl+F` | Search chats (in sidebar) |
| `Escape` | Clear search |

## Using the API

You can also interact with LLM Council programmatically.

### Simple Request (Python)

```python
import requests

BASE_URL = "http://localhost:8000"

# Create a session with your question
response = requests.post(f"{BASE_URL}/session", json={
    "question": "What are the key principles of clean code?"
})
session = response.json()["session"]
session_id = session["id"]

print(f"Session created: {session_id}")

# Run the full council process
result = requests.post(f"{BASE_URL}/session/{session_id}/run-all")
final = result.json()["session"]["rounds"][0]

# Print the results
print("\nCouncil Responses:")
for resp in final["responses"]:
    print(f"\n{resp['model_name']}:")
    print(resp["response"][:200] + "...")

print("\nFinal Synthesis:")
print(final["final_synthesis"])
```

### Using cURL

```bash
# Create a session
SESSION=$(curl -s -X POST http://localhost:8000/session \
  -H "Content-Type: application/json" \
  -d '{"question": "What is the best programming language for beginners?"}' \
  | jq -r '.session.id')

echo "Session ID: $SESSION"

# Run the full council process
curl -X POST "http://localhost:8000/session/$SESSION/run-all" | jq '.session.rounds[0].final_synthesis'
```

### Step-by-Step Control

For more control, you can run each step individually:

```python
import requests

BASE_URL = "http://localhost:8000"
session_id = "your-session-id"

# Step 1: Get council responses
requests.post(f"{BASE_URL}/session/{session_id}/responses")

# Step 2: Get peer reviews
requests.post(f"{BASE_URL}/session/{session_id}/reviews")

# Step 3: Get final synthesis
result = requests.post(f"{BASE_URL}/session/{session_id}/synthesize")

print(result.json()["session"]["rounds"][0]["final_synthesis"])
```

## Multi-turn Conversations

Continue the conversation with follow-up questions:

```python
# After the first round is complete...

# Add a follow-up question
requests.post(f"{BASE_URL}/session/{session_id}/continue", json={
    "question": "Can you give me specific examples?"
})

# Run the council again
result = requests.post(f"{BASE_URL}/session/{session_id}/run-all")

# The council now has context from the previous round
print(result.json()["session"]["rounds"][1]["final_synthesis"])
```

## What's Next?

- [Configuration](configuration.md) - Customize your council models
- [How It Works](../concepts/how-it-works.md) - Understand the council process
- [API Reference](../api/overview.md) - Explore all endpoints
