"""Job description endpoints."""

import uuid

from fastapi import APIRouter, Depends, File, UploadFile, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from merix.clients.base import EmbeddingClient, LLMClient
from merix.dependencies import get_db, get_embedder, get_llm
from merix.models.resume import Resume
from merix.schemas.job import JobCreate, JobResponse
from merix.schemas.match import ResumeResponse
from merix.services import extraction, pipeline

router = APIRouter()


@router.post("", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
async def create_job(
    body: JobCreate,
    db: AsyncSession = Depends(get_db),
    llm: LLMClient = Depends(get_llm),
    embedder: EmbeddingClient = Depends(get_embedder),
) -> object:
    """Create a job description: extract requirements, embed, persist."""
    return await pipeline.create_job(db, llm, embedder, body.title, body.raw_text)


@router.get("/{job_id}", response_model=JobResponse)
async def get_job(job_id: uuid.UUID, db: AsyncSession = Depends(get_db)) -> object:
    """Get a job description by id."""
    return await pipeline.get_job_or_404(db, job_id)


@router.post(
    "/{job_id}/resumes",
    response_model=ResumeResponse,
    status_code=status.HTTP_201_CREATED,
)
async def upload_resume(
    job_id: uuid.UUID,
    file: UploadFile = File(...),
    candidate_name: str | None = None,
    db: AsyncSession = Depends(get_db),
    llm: LLMClient = Depends(get_llm),
    embedder: EmbeddingClient = Depends(get_embedder),
) -> object:
    """Upload a resume PDF for a job: validate, extract, embed, persist."""
    job = await pipeline.get_job_or_404(db, job_id)
    data = await file.read()
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
    )
    return resume


@router.post("/{job_id}/match", status_code=status.HTTP_200_OK)
async def match_job(
    job_id: uuid.UUID,
    min_score: float | None = None,
    db: AsyncSession = Depends(get_db),
    llm: LLMClient = Depends(get_llm),
) -> dict:
    """Run the batch match for all resumes on a job; return ranked results.

    Returns everything ranked by default; pass min_score to filter server-side.
    """
    job = await pipeline.get_job_or_404(db, job_id)
    results = await pipeline.run_match_for_job(db, llm, job)
    if min_score is not None:
        results = [r for r in results if r.score >= min_score]
    resumes = {r.id: r for r in (await db.scalars(select(Resume).where(Resume.job_id == job.id))).all()}
    return {
        "job_id": str(job_id),
        "count": len(results),
        "results": [pipeline.to_match_response(r, resumes.get(r.resume_id)) for r in results],
    }


@router.get("/{job_id}/matches")
async def list_matches(
    job_id: uuid.UUID,
    min_score: float | None = None,
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Get the ranked shortlist (persisted match results) for a job."""
    job = await pipeline.get_job_or_404(db, job_id)
    results = await pipeline.list_matches_for_job(db, job, min_score=min_score)
    resumes = {r.id: r for r in (await db.scalars(select(Resume).where(Resume.job_id == job.id))).all()}
    return {
        "job_id": str(job_id),
        "count": len(results),
        "results": [pipeline.to_match_response(r, resumes.get(r.resume_id)) for r in results],
    }