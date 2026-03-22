"""Chat API endpoints with SSE streaming for AI-guided intake."""

import json
import uuid

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.engine import get_db
from app.models.intake import (
    IntakeChatMessage,
    IntakeSubmission,
    ChatRole,
)
from app.schemas.intake import ChatMessageCreate, ChatMessageResponse
from app.services.intake_ai import (
    extract_form_updates,
    stream_guide_conversation,
)

router = APIRouter()


async def _get_submission_or_404(
    db: AsyncSession, submission_id: uuid.UUID
) -> IntakeSubmission:
    result = await db.execute(
        select(IntakeSubmission).where(IntakeSubmission.id == submission_id)
    )
    submission = result.scalar_one_or_none()
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    return submission


async def _get_chat_history(
    db: AsyncSession, submission_id: uuid.UUID
) -> list[dict[str, str]]:
    result = await db.execute(
        select(IntakeChatMessage)
        .where(IntakeChatMessage.submission_id == submission_id)
        .order_by(IntakeChatMessage.created_at)
    )
    messages = result.scalars().all()
    return [{"role": msg.role.value, "content": msg.content} for msg in messages]


def _submission_form_state(submission: IntakeSubmission) -> dict:
    return {
        "pi_name": submission.pi_name or "",
        "pi_email": submission.pi_email or "",
        "department": submission.department or "",
        "project_title": submission.project_title or "",
        "project_description": submission.project_description or "",
        "project_goals": submission.project_goals or "",
        "timeline_preference": submission.timeline_preference or "",
    }


@router.get(
    "/{submission_id}/chat/history",
    response_model=list[ChatMessageResponse],
)
async def get_chat_history(
    submission_id: uuid.UUID, db: AsyncSession = Depends(get_db)
):
    """Retrieve conversation history for a submission."""
    await _get_submission_or_404(db, submission_id)
    result = await db.execute(
        select(IntakeChatMessage)
        .where(IntakeChatMessage.submission_id == submission_id)
        .order_by(IntakeChatMessage.created_at)
    )
    return result.scalars().all()


@router.post("/{submission_id}/chat/stream")
async def stream_chat(
    submission_id: uuid.UUID,
    message: ChatMessageCreate,
    db: AsyncSession = Depends(get_db),
):
    """Stream an AI response via SSE.

    SSE events:
    - event: token, data: {"text": "..."}
    - event: form_update, data: {"field": "...", "value": "..."}
    - event: done, data: {}
    - event: error, data: {"message": "..."}
    """
    submission = await _get_submission_or_404(db, submission_id)

    # Save user message
    user_msg = IntakeChatMessage(
        submission_id=submission_id,
        role=ChatRole.user,
        content=message.content,
    )
    db.add(user_msg)
    await db.flush()

    # Get chat history
    chat_history = await _get_chat_history(db, submission_id)
    form_state = _submission_form_state(submission)

    async def event_generator():
        full_response = ""
        try:
            async for token in stream_guide_conversation(
                chat_history, form_state
            ):
                full_response += token
                yield f"event: token\ndata: {json.dumps({'text': token})}\n\n"

            # Parse completed response for form updates
            response_text, form_updates = extract_form_updates(full_response)

            # Send form updates as separate events
            if form_updates:
                yield f"event: form_update\ndata: {json.dumps(form_updates)}\n\n"

            # Save assistant message
            assistant_msg = IntakeChatMessage(
                submission_id=submission_id,
                role=ChatRole.assistant,
                content=response_text,
            )
            db.add(assistant_msg)
            await db.flush()

            yield f"event: done\ndata: {{}}\n\n"

        except Exception as e:
            yield f"event: error\ndata: {json.dumps({'message': str(e)})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
