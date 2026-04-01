from typing import Literal, Optional
from pydantic import BaseModel, Field

ALLOWED_ISSUE_TYPES = [
    "UI bug",
    "Overactive refusal",
    "Poor image understanding",
    "Did not fully follow my request",
    "Not factually correct",
    "Incomplete response",
    "Issue with thought process",
    "Should have searched the web",
    "Other",
]


class FeedbackCreate(BaseModel):
    """Request to submit feedback on an assistant message."""

    message_index: int = Field(..., ge=0, description="Index of the message in the session")
    rating: Literal["positive", "negative"] = Field(..., description="Feedback rating")
    comment: Optional[str] = Field(None, max_length=2000, description="Optional feedback text")
    issue_type: Optional[str] = Field(None, description="Issue category for negative feedback")


class FeedbackResponse(BaseModel):
    """Response after submitting feedback."""

    message: str
