"""Job description endpoints.

All routes require authentication and operate only on the caller's
organisation: the scoped session pins the RLS context (app.current_org_id)
so Postgres itself enforces isolation, and the pipeline's org filter keeps
cross-org IDs indistinguishable from non-existent ones (404, no leak).
"""

import uuid

from fastapi import APIRouter, Depends, File, Form, UploadFile, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from merix.clients.base import EmbeddingClient, LLMClient
from merix.core.exceptions import FileTooLargeError
from merix.dependencies import get_current_user, get_embedder, get_llm, get_scoped_db
from merix.models.resume import Resume
from merix.models.user import User
from merix.schemas.job import JobCreate, JobResponse
from merix.schemas.match import ResumeResponse
from merix.services import extraction, pipeline

router = APIRouter()


async def _shortlist_payload(db: AsyncSession, job, results) -> dict:
    """Serialise ranked match results with their resumes' candidate names."""
    resumes = {
        r.id: r
        for r in (await db.scalars(select(Resume).where(Resume.job_id == job.id))).all()
    }
    return {
        "job_id": str(job.id),
        "count": len(results),
        "results": [
            pipeline.to_match_response(r, resumes.get(r.resume_id)) for r in results
        ],
    }


@router.post("", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
async def create_job(
    body: JobCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_scoped_db),
    llm: LLMClient = Depends(get_llm),
    embedder: EmbeddingClient = Depends(get_embedder),
) -> object:
    """Create a job description: extract requirements, embed, persist."""
    return await pipeline.create_job(
        db, llm, embedder, user.org_id, body.title, body.raw_text
    )


@router.get("/{job_id}", response_model=JobResponse)
async def get_job(
    job_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_scoped_db),
) -> object:
    """Get a job description by id (caller's org only)."""
    return await pipeline.get_job_or_404(db, job_id, user.org_id)


@router.post(
    "/{job_id}/resumes",
    response_model=ResumeResponse,
    status_code=status.HTTP_201_CREATED,
)
async def upload_resume(
    job_id: uuid.UUID,
    file: UploadFile = File(...),
    candidate_name: str | None = Form(None, max_length=255),
    consent_given: bool = Form(...),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_scoped_db),
    llm: LLMClient = Depends(get_llm),
    embedder: EmbeddingClient = Depends(get_embedder),
) -> object:
    """Upload a resume PDF for a job: validate, extract, embed, persist.

    consent_given must be true; the consent timestamp is recorded server-side.
    """
    job = await pipeline.get_job_or_404(db, job_id, user.org_id)
    # Read at most one byte beyond the cap so an oversized/malicious upload can
    # never be fully buffered in memory before being rejected.
    data = await file.read(extraction.MAX_FILE_BYTES + 1)
    if len(data) > extraction.MAX_FILE_BYTES:
        raise FileTooLargeError(extraction.MAX_FILE_BYTES)
    text = extraction.extract_text_from_pdf(data)  # raises domain errors on reject
    scrubbed = extraction.scrub_pii(text)
    resume = await pipeline.add_resume(
        db,
        llm,
        embedder,
        job,
        raw_text=scrubbed,
        original_filename=file.filename or "resume.pdf",
        candidate_name=candidate_name,
        consent_given=consent_given,
    )
    return resume


@router.post("/{job_id}/match", status_code=status.HTTP_200_OK)
async def match_job(
    job_id: uuid.UUID,
    min_score: float | None = None,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_scoped_db),
    llm: LLMClient = Depends(get_llm),
) -> dict:
    """Run the batch match for all resumes on a job; return ranked results.

    Returns everything ranked by default; pass min_score to filter server-side.
    """
    job = await pipeline.get_job_or_404(db, job_id, user.org_id)
    results = await pipeline.run_match_for_job(db, llm, job)
    if min_score is not None:
        results = [r for r in results if r.score >= min_score]
    return await _shortlist_payload(db, job, results)


@router.get("/{job_id}/matches")
async def list_matches(
    job_id: uuid.UUID,
    min_score: float | None = None,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_scoped_db),
) -> dict:
    """Get the ranked shortlist (persisted match results) for a job."""
    job = await pipeline.get_job_or_404(db, job_id, user.org_id)
    results = await pipeline.list_matches_for_job(db, job, min_score=min_score)
    return await _shortlist_payload(db, job, results)
