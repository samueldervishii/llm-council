from typing import List, Optional

from schemas import ModelResponse, ConversationRound


class Prompts:
    """Centralized prompt templates for the LLM Council."""

    COUNCIL_MEMBER_SYSTEM = (
        "You are a helpful assistant participating in a council of AI models. "
        "Provide a direct, thoughtful, and concise answer to the user's question. "
        "Do NOT ask follow-up questions. Do NOT ask for clarification. "
        "Just give your best answer based on the question asked."
    )

    COUNCIL_MEMBER_SYSTEM_WITH_CONTEXT = (
        "You are a helpful assistant participating in a council of AI models. "
        "You are continuing an ongoing conversation. Use the previous context to provide "
        "a relevant, direct, and concise answer to the user's follow-up question. "
        "Do NOT ask follow-up questions. Do NOT ask for clarification. "
        "Just give your best answer based on the conversation context."
    )

    CHAIRMAN_SYSTEM = (
        "You are the Chairman of an AI council. "
        "Synthesize the collective wisdom into a clear, authoritative final answer."
    )

    @staticmethod
    def build_conversation_context(previous_rounds: List[ConversationRound]) -> str:
        """Build conversation context from previous rounds."""
        if not previous_rounds:
            return ""

        context = "=== PREVIOUS CONVERSATION ===\n"
        for i, round in enumerate(previous_rounds, 1):
            context += f"\n--- Round {i} ---\n"
            context += f"User Question: {round.question}\n"
            if round.final_synthesis:
                context += f"Council Verdict: {round.final_synthesis}\n"
        context += "\n=== END PREVIOUS CONVERSATION ===\n\n"
        return context

    @staticmethod
    def build_question_with_context(
            question: str,
            previous_rounds: Optional[List[ConversationRound]] = None
    ) -> str:
        """Build the question prompt with optional conversation context."""
        if not previous_rounds:
            return question

        context = Prompts.build_conversation_context(previous_rounds)
        return f"{context}Current Question: {question}"

    @staticmethod
    def build_review_prompt(
            question: str,
            valid_responses: List[ModelResponse],
            reviewer_id: str,
            previous_rounds: Optional[List[ConversationRound]] = None
    ) -> str:
        """Build the peer review prompt for a council member."""
        responses_text = ""
        for i, resp in enumerate(valid_responses):
            if resp.model_id != reviewer_id:
                responses_text += f"\n\n--- Response {i + 1} ---\n{resp.response}"

        context = ""
        if previous_rounds:
            context = Prompts.build_conversation_context(previous_rounds)

        return f"""{context}You are reviewing responses from other AI models to the following question:

Question: {question}

Here are the anonymous responses:
{responses_text}

Please rank these responses from best to worst based on:
1. Accuracy and correctness
2. Clarity and helpfulness
3. Completeness

Provide your ranking as a JSON array with this format:
[
  {{"response_num": 1, "rank": 1, "reasoning": "Brief explanation"}},
  {{"response_num": 2, "rank": 2, "reasoning": "Brief explanation"}}
]

Only output the JSON array, nothing else."""

    @staticmethod
    def build_synthesis_prompt(
            question: str,
            valid_responses: List[ModelResponse],
            reviews_text: str,
            previous_rounds: Optional[List[ConversationRound]] = None
    ) -> str:
        """Build the synthesis prompt for the chairman."""
        responses_text = ""
        for resp in valid_responses:
            responses_text += f"\n\n--- {resp.model_name} ---\n{resp.response}"

        context = ""
        if previous_rounds:
            context = Prompts.build_conversation_context(previous_rounds)

        return f"""{context}You are Grok, the Chairman of a council of AI models. Your job is to give the final verdict based on the council's responses.

Original Question: {question}

Council Responses:
{responses_text}

Peer Reviews (rankings from each model):
{reviews_text}

Based on all the responses and peer reviews:
1. Summarize what the council members said
2. State which response(s) you agree with most and why
3. Give YOUR final opinion/answer to the original question

Be direct and decisive. Do NOT ask follow-up questions. Give a clear final answer."""
