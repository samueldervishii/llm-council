# Multi-turn Conversations

Learn how to have extended conversations with the council.

## Overview

LLM Council supports multi-turn conversations where you can ask follow-up questions. The council maintains context from previous rounds, allowing for deeper exploration of topics.

## Basic Multi-turn Example

```python
import requests

BASE_URL = "http://localhost:8000"

class CouncilChat:
    """A simple wrapper for multi-turn council conversations."""

    def __init__(self):
        self.session_id = None

    def ask(self, question: str) -> str:
        """Ask a question (creates new session or continues existing)."""
        if self.session_id is None:
            # Create new session
            response = requests.post(
                f"{BASE_URL}/session",
                json={"question": question}
            )
            self.session_id = response.json()["session"]["id"]
        else:
            # Continue existing session
            requests.post(
                f"{BASE_URL}/session/{self.session_id}/continue",
                json={"question": question}
            )

        # Run the council
        result = requests.post(f"{BASE_URL}/session/{self.session_id}/run-all")
        rounds = result.json()["session"]["rounds"]

        # Return the latest synthesis
        return rounds[-1]["final_synthesis"]

    def reset(self):
        """Start a new conversation."""
        self.session_id = None


# Usage
chat = CouncilChat()

# First question
print("Q1: What is machine learning?")
answer1 = chat.ask("What is machine learning?")
print(f"A1: {answer1}\n")

# Follow-up
print("Q2: What are the main types?")
answer2 = chat.ask("What are the main types?")
print(f"A2: {answer2}\n")

# Another follow-up
print("Q3: Which type is best for image recognition?")
answer3 = chat.ask("Which type is best for image recognition?")
print(f"A3: {answer3}")
```

## Viewing Conversation History

Access the full conversation history.

```python
import requests

BASE_URL = "http://localhost:8000"

def print_conversation_history(session_id: str):
    """Print the full conversation history."""
    response = requests.get(f"{BASE_URL}/session/{session_id}")
    session = response.json()["session"]

    print(f"Session: {session['title']}")
    print(f"Rounds: {len(session['rounds'])}")
    print("=" * 60)

    for i, round_data in enumerate(session["rounds"], 1):
        print(f"\n📍 Round {i}")
        print(f"   Q: {round_data['question']}")
        print(f"   Status: {round_data['status']}")

        if round_data.get("final_synthesis"):
            # Truncate for display
            synthesis = round_data["final_synthesis"]
            preview = synthesis[:200] + "..." if len(synthesis) > 200 else synthesis
            print(f"   A: {preview}")


# Usage
print_conversation_history("your-session-id")
```

## Context-Aware Conversations

The council uses previous rounds as context.

```python
import requests

BASE_URL = "http://localhost:8000"

def deep_dive_conversation():
    """Example of a deep-dive conversation."""

    # Start with a broad question
    response = requests.post(
        f"{BASE_URL}/session",
        json={"question": "What are microservices?"}
    )
    session_id = response.json()["session"]["id"]
    requests.post(f"{BASE_URL}/session/{session_id}/run-all")

    follow_ups = [
        "What are the main benefits?",
        "What are the challenges?",
        "How do I decide if my project needs microservices?",
        "Can you give me a simple example architecture?"
    ]

    for question in follow_ups:
        print(f"\n{question}")

        # Continue the conversation
        requests.post(
            f"{BASE_URL}/session/{session_id}/continue",
            json={"question": question}
        )

        result = requests.post(f"{BASE_URL}/session/{session_id}/run-all")
        answer = result.json()["session"]["rounds"][-1]["final_synthesis"]

        # Print truncated answer
        preview = answer[:300] + "..." if len(answer) > 300 else answer
        print(f"{preview}")

    return session_id


# Usage
session_id = deep_dive_conversation()
print(f"\nFull conversation saved in session: {session_id}")
```

## Branching Conversations

Start new conversations from any point.

```python
import requests

BASE_URL = "http://localhost:8000"

def branch_conversation(original_session_id: str, new_question: str) -> str:
    """
    Start a new conversation branch based on an existing session.

    Note: This creates a new session - the original is preserved.
    """
    # Get original session for context
    response = requests.get(f"{BASE_URL}/session/{original_session_id}")
    original = response.json()["session"]

    # Build context from original
    context_parts = []
    for round_data in original["rounds"]:
        context_parts.append(f"Q: {round_data['question']}")
        if round_data.get("final_synthesis"):
            context_parts.append(f"A: {round_data['final_synthesis'][:500]}")

    context = "\n".join(context_parts)

    # Create new session with context in the question
    full_question = f"""Based on this previous conversation:
---
{context}
---

New question: {new_question}"""

    response = requests.post(f"{BASE_URL}/session", json={"question": full_question})
    new_session_id = response.json()["session"]["id"]

    # Run the council
    result = requests.post(f"{BASE_URL}/session/{new_session_id}/run-all")

    return result.json()["session"]["rounds"][0]["final_synthesis"]


# Usage
# Assuming you have an existing session about Python
# branch_answer = branch_conversation("original-session-id", "How does this compare to JavaScript?")
```

## Interactive CLI Chat

A complete interactive chat example.

```python
import requests

BASE_URL = "http://localhost:8000"

def interactive_chat():
    """Run an interactive chat session with the council."""
    print("=" * 60)
    print("LLM Council Interactive Chat")
    print("Type 'quit' to exit, 'new' to start fresh")
    print("=" * 60)

    session_id = None

    while True:
        # Get user input
        try:
            question = input("\nYou: ").strip()
        except (KeyboardInterrupt, EOFError):
            print("\nGoodbye!")
            break

        if not question:
            continue

        if question.lower() == 'quit':
            print("Goodbye!")
            break

        if question.lower() == 'new':
            session_id = None
            print("Starting new conversation...")
            continue

        try:
            if session_id is None:
                # Create new session
                response = requests.post(
                    f"{BASE_URL}/session",
                    json={"question": question}
                )
                session_id = response.json()["session"]["id"]
            else:
                # Continue session
                requests.post(
                    f"{BASE_URL}/session/{session_id}/continue",
                    json={"question": question}
                )

            print("\nCouncil is deliberating...")

            # Run council
            result = requests.post(f"{BASE_URL}/session/{session_id}/run-all")
            answer = result.json()["session"]["rounds"][-1]["final_synthesis"]

            print(f"\nCouncil: {answer}")

        except Exception as e:
            print(f"\nError: {e}")


if __name__ == "__main__":
    interactive_chat()
```

## Best Practices

!!! tip "Tips for Multi-turn Conversations"

    1. **Be Specific**: Follow-up questions work best when they reference previous context
    2. **Build Incrementally**: Start broad, then narrow down
    3. **Use Pronouns**: "Can you explain that further?" works because context is maintained
    4. **Check Status**: Always verify the previous round is complete before continuing

!!! warning "Limitations"

    - Each round adds to context length (may hit model limits)
    - Very long conversations may lose early context
    - Consider starting fresh for unrelated topics

## Next Steps

- [Basic Usage](basic-usage.md) - Foundational examples
- [API Reference](../api/sessions.md) - Full session API
