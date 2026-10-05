from typing import Optional

from pydantic import BaseModel, Field


class AIRequest(BaseModel):
    question: str = Field(
        ...,
        min_length=1,
        max_length=5000
    )

    expression: Optional[str] = None

    result: Optional[str] = None


class AIResponse(BaseModel):
    success: bool
    question: str
    answer: str
    model: str