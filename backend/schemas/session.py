from enum import Enum
from typing import List, Optional, Dict, Any

from pydantic import BaseModel, ConfigDict


class ModelProvider(str, Enum):
    OPENROUTER = "openrouter"
    GOOGLE = "google"


class ModelInfo(BaseModel):
    id: str
    name: str
    provider: ModelProvider


class QueryRequest(BaseModel):
    question: str


class ContinueRequest(BaseModel):
    question: str


class ModelResponse(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    model_id: str
    model_name: str
    response: str
    error: Optional[str] = None


class PeerReview(BaseModel):
    reviewer_model: str
    rankings: List[Dict[str, Any]]


class ConversationRound(BaseModel):
    """A single round of conversation (question + council responses)."""
    question: str
    responses: List[ModelResponse] = []
    peer_reviews: List[PeerReview] = []
    final_synthesis: Optional[str] = None
    status: str = "pending"  # pending, responses_complete, reviews_complete, synthesized


class CouncilSession(BaseModel):
    id: str
    title: Optional[str] = None
    rounds: List[ConversationRound] = []
    is_deleted: bool = False
    deleted_at: Optional[str] = None


class SynthesisRequest(BaseModel):
    session_id: str


class SessionResponse(BaseModel):
    session: CouncilSession
    message: str


class SessionSummary(BaseModel):
    id: str
    title: Optional[str] = None
    question: str
    status: str
    round_count: int = 1
    created_at: Optional[str] = None


class SessionListResponse(BaseModel):
    sessions: List[SessionSummary]
    count: int
