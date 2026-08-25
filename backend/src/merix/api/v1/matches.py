"""Match result endpoints (read-side of the vertical slice).

Authenticated and org-scoped like the rest of the API.
"""

import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from merix.dependencies import get_current_user, get_scoped_db
from merix.models.match_note import MatchNote
from merix.models.resume import Resume
from merix.models.user import User
from merix.schemas.match import MatchNoteCreate, MatchNoteResponse
from merix.services import pipeline

router = APIRouter()


@router.get("/{match_id}")
async def get_match(
    match_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_scoped_db),
) -> dict:
    """Get a single match result with full explainability."""
    match = await pipeline.get_match_or_404(db, match_id, user.org_id)
    resume = await db.get(Resume, match.resume_id)
    return pipeline.to_match_response(match, resume)


@router.get("/{match_id}/notes")
async def list_match_notes(
    match_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_scoped_db),
) -> list[dict]:
    """List recruiter notes on a match, newest first."""
    match = await pipeline.get_match_or_404(db, match_id, user.org_id)
    stmt = (
        select(MatchNote, User.email)
        .join(User, MatchNote.author_id == User.id, isouter=True)
        .where(MatchNote.match_id == match.id)
        .order_by(MatchNote.created_at.desc())
    )
    rows = (await db.execute(stmt)).all()
    return [
        MatchNoteResponse.model_validate(
            {
                "id": note.id,
                "match_id": note.match_id,
                "author_id": note.author_id,
                "author_email": email,
                "body": note.body,
                "created_at": note.created_at,
                "updated_at": note.updated_at,
            }
        ).model_dump(mode="json")
        for note, email in rows
    ]


@router.post("/{match_id}/notes", status_code=status.HTTP_201_CREATED)
async def create_match_note(
    match_id: uuid.UUID,
    payload: MatchNoteCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_scoped_db),
) -> dict:
    """Add an org-visible, author-attributed note to a match."""
    match = await pipeline.get_match_or_404(db, match_id, user.org_id)
    note = MatchNote(
        org_id=user.org_id,
        match_id=match.id,
        author_id=user.id,
        body=payload.body.strip(),
    )
    db.add(note)
    await db.commit()
    await db.refresh(note)
    return MatchNoteResponse.model_validate(
        {
            "id": note.id,
            "match_id": note.match_id,
            "author_id": note.author_id,
            "author_email": user.email,
            "body": note.body,
            "created_at": note.created_at,
            "updated_at": note.updated_at,
        }
    ).model_dump(mode="json")
