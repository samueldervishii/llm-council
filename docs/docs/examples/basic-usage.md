# Basic Usage

Learn the fundamentals of using LLM Council through practical examples.

## Simple Query

The most basic usage: ask a question and get a synthesized answer.

### Python

```python
import requests

BASE_URL = "http://localhost:8000"

def ask_council(question: str) -> str:
    """Ask the council a question and get the synthesized answer."""
    # Create session
    response = requests.post(f"{BASE_URL}/session", json={"question": question})
    session_id = response.json()["session"]["id"]

    # Run full council process
    result = requests.post(f"{BASE_URL}/session/{session_id}/run-all")

    # Extract final answer
    return result.json()["session"]["rounds"][0]["final_synthesis"]


# Usage
answer = ask_council("What are the key principles of clean code?")
print(answer)
```

### JavaScript/Node.js

```javascript
const BASE_URL = "http://localhost:8000";

async function askCouncil(question) {
  // Create session
  const sessionRes = await fetch(`${BASE_URL}/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });
  const { session } = await sessionRes.json();

  // Run full council process
  const resultRes = await fetch(`${BASE_URL}/session/${session.id}/run-all`, {
    method: "POST",
  });
  const result = await resultRes.json();

  // Extract final answer
  return result.session.rounds[0].final_synthesis;
}

// Usage
askCouncil("What are the key principles of clean code?").then((answer) =>
  console.log(answer)
);
```

## Accessing Individual Responses

Sometimes you want to see what each council member said, not just the synthesis.

```python
import requests

BASE_URL = "http://localhost:8000"

def get_all_perspectives(question: str):
    """Get individual responses from each council member."""
    # Create and run
    response = requests.post(f"{BASE_URL}/session", json={"question": question})
    session_id = response.json()["session"]["id"]
    result = requests.post(f"{BASE_URL}/session/{session_id}/run-all")

    round_data = result.json()["session"]["rounds"][0]

    # Print each model's response
    print("=" * 60)
    print("INDIVIDUAL RESPONSES")
    print("=" * 60)

    for resp in round_data["responses"]:
        print(f"\n{resp['model_name']}")
        print("-" * 40)
        print(resp["response"])

    # Print synthesis
    print("\n" + "=" * 60)
    print("SYNTHESIZED ANSWER")
    print("=" * 60)
    print(round_data["final_synthesis"])


# Usage
get_all_perspectives("Should I use SQL or NoSQL for my next project?")
```

## Viewing Peer Reviews

See how models evaluated each other.

```python
import requests

BASE_URL = "http://localhost:8000"

def show_peer_reviews(question: str):
    """Display peer review rankings."""
    response = requests.post(f"{BASE_URL}/session", json={"question": question})
    session_id = response.json()["session"]["id"]
    result = requests.post(f"{BASE_URL}/session/{session_id}/run-all")

    round_data = result.json()["session"]["rounds"][0]

    print("PEER REVIEW RESULTS")
    print("=" * 60)

    for review in round_data["peer_reviews"]:
        print(f"\n🔍 Reviewer: {review['reviewer_model']}")
        print("-" * 40)

        for ranking in review["rankings"]:
            print(f"  {ranking['rank']}. {ranking.get('model_id', 'Unknown')}")
            if 'score' in ranking:
                print(f"     Score: {ranking['score']}/10")
            if 'reasoning' in ranking:
                print(f"     Reason: {ranking['reasoning'][:100]}...")


# Usage
show_peer_reviews("What's the best programming language for beginners?")
```

## Step-by-Step Processing

For more control, run each phase separately.

```python
import requests
import time

BASE_URL = "http://localhost:8000"

def process_step_by_step(question: str):
    """Run the council process step by step."""

    # Step 1: Create session
    print("Creating session...")
    response = requests.post(f"{BASE_URL}/session", json={"question": question})
    session_id = response.json()["session"]["id"]
    print(f"   Session ID: {session_id}")

    # Step 2: Collect responses
    print("\nCollecting council responses...")
    start = time.time()
    requests.post(f"{BASE_URL}/session/{session_id}/responses")
    print(f"   Done in {time.time() - start:.1f}s")

    # Step 3: Peer reviews
    print("\nCollecting peer reviews...")
    start = time.time()
    requests.post(f"{BASE_URL}/session/{session_id}/reviews")
    print(f"   Done in {time.time() - start:.1f}s")

    # Step 4: Synthesis
    print("\n✨ Synthesizing final answer...")
    start = time.time()
    result = requests.post(f"{BASE_URL}/session/{session_id}/synthesize")
    print(f"   Done in {time.time() - start:.1f}s")

    # Return the final answer
    return result.json()["session"]["rounds"][0]["final_synthesis"]


# Usage
answer = process_step_by_step("How do I improve my code review process?")
print("\n" + "=" * 60)
print("FINAL ANSWER:")
print("=" * 60)
print(answer)
```

## Error Handling

Proper error handling for production use.

```python
import requests
from typing import Optional

BASE_URL = "http://localhost:8000"

class CouncilError(Exception):
    """Custom exception for council errors."""
    pass

def ask_council_safe(question: str) -> Optional[str]:
    """Ask the council with proper error handling."""
    try:
        # Create session
        response = requests.post(
            f"{BASE_URL}/session",
            json={"question": question},
            timeout=10
        )
        response.raise_for_status()
        session_id = response.json()["session"]["id"]

        # Run council (with longer timeout)
        result = requests.post(
            f"{BASE_URL}/session/{session_id}/run-all",
            timeout=120  # Council process can take a while
        )
        result.raise_for_status()

        data = result.json()

        # Check for valid synthesis
        synthesis = data["session"]["rounds"][0].get("final_synthesis")
        if not synthesis:
            raise CouncilError("No synthesis generated")

        return synthesis

    except requests.exceptions.Timeout:
        print("Error: Request timed out")
        return None
    except requests.exceptions.ConnectionError:
        print("Error: Cannot connect to API")
        return None
    except requests.exceptions.HTTPError as e:
        print(f"Error: HTTP {e.response.status_code}")
        return None
    except CouncilError as e:
        print(f"Error: {e}")
        return None
    except Exception as e:
        print(f"Unexpected error: {e}")
        return None


# Usage
answer = ask_council_safe("What is Docker?")
if answer:
    print(answer)
else:
    print("Failed to get answer from council")
```

## Next Steps

- [Multi-turn Conversations](multi-turn.md) - Continue conversations
- [API Reference](../api/overview.md) - Full API documentation
