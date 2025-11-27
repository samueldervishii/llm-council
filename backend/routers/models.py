from fastapi import APIRouter

from config import COUNCIL_MODELS, CHAIRMAN_MODEL

router = APIRouter(tags=["models"])


@router.get("/models")
async def get_models():
    """
    Get Configured Models

    Returns the list of LLM models configured for the council, including:

    - **council_models**: The panel of LLMs that respond to questions and review each other
    - **chairman_model**: The LLM responsible for synthesizing the final answer

    Use this endpoint to see which models are available in your council setup.
    """
    return {
        "council_models": COUNCIL_MODELS,
        "chairman_model": CHAIRMAN_MODEL
    }
