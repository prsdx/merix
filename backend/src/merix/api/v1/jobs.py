"""Job description endpoints.

All routes require authentication and operate only on the caller's
organisation: the scoped session pins the RLS context (app.current_org_id)
so Postgres itself enforces isolation, and the pipeline's org filter keeps
cross-org IDs indistinguishable from non-existent ones (404, no leak).
"""

import logging
import uuid

from fastapi import (
    APIRouter,
    BackgroundTasks,
    Body,
    Depends,
    File,
    Form,
    UploadFile,
    status,
)
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from merix.clients.base import EmbeddingClient, LLMClient
from merix.core.exceptions import FileTooLargeError, NotFoundError
from merix.dependencies import get_current_user, get_embedder, get_llm, get_scoped_db
from merix.models.batch_job import BatchJob
from merix.models.job import JobDescription
from merix.models.match import MatchResult
from merix.models.resume import Resume
from merix.models.user import User
from merix.schemas.batch_job import BatchJobCreate, BatchJobStatus
from merix.schemas.job import JobCreate, JobFromURLCreate, JobResponse, JobSummaryResponse
from merix.schemas.match import ResumeResponse
from merix.services import consent, extraction, pipeline, retention
from merix.services import links as links_service
from merix.services.batch import process_resume_background, run_batch_match_background
from merix.services.jd_fetch import default_jd_fetcher as jd_fetcher

logger = logging.getLogger("merix.api.jobs")

router = APIRouter()


async def _shortlist_payload(db: AsyncSession, job, results) -> dict:
    """Serialise ranked match results with their resumes' candidate names."""
    resumes = {r.id: r for r in (await db.scalars(select(Resume).where(Resume.job_id == job.id))).all()}
    return {
        "job_id": str(job.id),
        "count": len(results),
        "results": [pipeline.to_match_response(r, resumes.get(r.resume_id)) for r in results],
    }


@router.get("", response_model=list[JobSummaryResponse])
async def list_jobs(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_scoped_db),
) -> list[JobSummaryResponse]:
    """List all job descriptions for the caller's organisation."""
    jobs = list(
        (
            await db.scalars(
                select(JobDescription).where(JobDescription.org_id == user.org_id).order_by(JobDescription.created_at.desc())
            )
        ).all()
    )

    summaries = []
    for j in jobs:
        r_count = (await db.scalar(select(func.count()).select_from(Resume).where(Resume.job_id == j.id))) or 0
        m_count = (await db.scalar(select(func.count()).select_from(MatchResult).where(MatchResult.job_id == j.id))) or 0
        summaries.append(
            JobSummaryResponse(
                id=j.id,
                title=j.title,
                created_at=j.created_at,
                resume_count=r_count,
                match_count=m_count,
                parsed=j.parsed,
            )
        )
    return summaries


@router.post("", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
async def create_job(
    body: JobCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_scoped_db),
    llm: LLMClient = Depends(get_llm),
    embedder: EmbeddingClient = Depends(get_embedder),
) -> object:
    """Create a job description: extract requirements, embed, persist."""
    return await pipeline.create_job(db, llm, embedder, user.org_id, body.title, body.raw_text)


@router.post("/from-url", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
async def create_job_from_url(
    body: JobFromURLCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_scoped_db),
    llm: LLMClient = Depends(get_llm),
    embedder: EmbeddingClient = Depends(get_embedder),
) -> object:
    """Create a job description by fetching a career-board posting URL.

    The fetch is SSRF-guarded (public IPs only, board-domain allowlist by
    default) and the page text replaces manual pasting. Registered BEFORE the
    ``/{job_id}`` routes so "from-url" is never parsed as a job UUID.
    """
    fetched = await jd_fetcher.fetch(body.url)
    title = (body.title or fetched["title"] or "Untitled role").strip()[:255]
    logger.info("job_created_from_url org=%s url=%s title=%s", user.org_id, body.url, title)
    return await pipeline.create_job(db, llm, embedder, user.org_id, title, fetched["text"][:50_000])


@router.get("/{job_id}", response_model=JobResponse)
async def get_job(
    job_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_scoped_db),
) -> object:
    """Get a job description by id (caller's org only)."""
    return await pipeline.get_job_or_404(db, job_id, user.org_id)


@router.get("/{job_id}/resumes/{resume_id}", response_model=ResumeResponse)
async def get_job_resume(
    job_id: uuid.UUID,
    resume_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_scoped_db),
) -> Resume:
    """Get one resume (caller's org + job only; 404 otherwise — no existence leak)."""
    await pipeline.get_job_or_404(db, job_id, user.org_id)
    resume = await db.scalar(select(Resume).where(Resume.id == resume_id, Resume.job_id == job_id, Resume.org_id == user.org_id))
    if resume is None:
        raise NotFoundError(f"resume {resume_id} not found")
    return resume


@router.get("/{job_id}/resumes", response_model=list[ResumeResponse])
async def list_job_resumes(
    job_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_scoped_db),
) -> list[Resume]:
    """List all resumes uploaded for a job description."""
    await pipeline.get_job_or_404(db, job_id, user.org_id)
    resumes = list(
        (
            await db.scalars(
                select(Resume).where(Resume.job_id == job_id, Resume.org_id == user.org_id).order_by(Resume.created_at.desc())
            )
        ).all()
    )
    return resumes


@router.post(
    "/{job_id}/resumes",
    response_model=BatchJobStatus,
    status_code=status.HTTP_202_ACCEPTED,
)
async def upload_resume(
    job_id: uuid.UUID,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    candidate_name: str | None = Form(None, max_length=255),
    consent_given: bool = Form(...),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_scoped_db),
    llm: LLMClient = Depends(get_llm),
    embedder: EmbeddingClient = Depends(get_embedder),
) -> BatchJob:
    """Upload a resume PDF for a job: validate now, process asynchronously.

    Fast checks happen synchronously so bad uploads are rejected immediately
    with the same errors as before: job must exist in the caller's org (404),
    DPDP consent must be given (400), file within size cap (413), valid
    parseable PDF (422). The slow LLM extraction + embedding then run in a
    background task using Task 5's BatchJob infrastructure; returns 202
    Accepted with the BatchJobStatus — poll ``GET /api/batch-jobs/{id}``
    for completion.
    """
    await pipeline.get_job_or_404(db, job_id, user.org_id)
    # DPDP gate: reject missing consent immediately instead of 202-then-fail.
    consent.require_consent(consent_given)
    # Read at most one byte beyond the cap so an oversized/malicious upload can
    # never be fully buffered in memory before being rejected.
    data = await file.read(extraction.MAX_FILE_BYTES + 1)
    if len(data) > extraction.MAX_FILE_BYTES:
        raise FileTooLargeError(extraction.MAX_FILE_BYTES)
    text = extraction.extract_text_from_pdf(data)  # raises domain errors on reject
    # Extract links BEFORE scrubbing destroys them; stored as structured data.
    resume_links = links_service.collect_links(data)
    scrubbed = extraction.scrub_pii(text)

    batch_job = BatchJob(
        org_id=user.org_id,
        job_description_id=job_id,
        status="queued",
        total_resumes=1,
        completed_resumes=0,
    )
    db.add(batch_job)
    await db.commit()
    await db.refresh(batch_job)

    # Enqueue the slow processing. The background task creates its own
    # scoped session; we pass the clients so they can be mocked in tests.
    background_tasks.add_task(
        process_resume_background,
        org_id=user.org_id,
        job_id=job_id,
        batch_job_id=batch_job.id,
        raw_text=scrubbed,
        original_filename=file.filename or "resume.pdf",
        candidate_name=candidate_name,
        llm=llm,
        embedder=embedder,
        resume_links=resume_links,
    )

    return batch_job


@router.post(
    "/{job_id}/match",
    response_model=BatchJobStatus,
    status_code=status.HTTP_202_ACCEPTED,
)
async def match_job(
    job_id: uuid.UUID,
    background_tasks: BackgroundTasks,
    body: BatchJobCreate = Body(default_factory=BatchJobCreate),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_scoped_db),
    llm: LLMClient = Depends(get_llm),
) -> BatchJob:
    """Submit a batch match job for all resumes on a job description.

    Returns 202 Accepted immediately with the batch job status.
    The actual matching runs asynchronously via a background task;
    poll ``GET /api/batch-jobs/{id}`` for progress.
    """

    # Validate job exists (org-scoped, 404 if not).
    await pipeline.get_job_or_404(db, job_id, user.org_id)

    # Idempotency: if the client supplied a key and we already have a
    # BatchJob for it, return the existing one (no duplicate).
    if body.idempotency_key is not None:
        existing = await db.scalar(
            select(BatchJob).where(
                BatchJob.idempotency_key == body.idempotency_key,
                BatchJob.org_id == user.org_id,
            )
        )
        if existing is not None:
            return existing

    # Count resumes for this job.
    total_resumes: int = (await db.scalar(select(func.count()).select_from(Resume).where(Resume.job_id == job_id))) or 0

    batch_job = BatchJob(
        org_id=user.org_id,
        job_description_id=job_id,
        status="queued",
        idempotency_key=body.idempotency_key,
        total_resumes=total_resumes,
        completed_resumes=0,
    )
    db.add(batch_job)
    await db.commit()
    await db.refresh(batch_job)

    # Enqueue the real work. The background task creates its own session
    # but we pass the llm client so it can be mocked in tests.
    background_tasks.add_task(
        run_batch_match_background,
        org_id=user.org_id,
        job_id=job_id,
        batch_job_id=batch_job.id,
        llm=llm,
    )

    return batch_job


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


@router.get("/{job_id}/matches/export")
async def export_matches(
    job_id: uuid.UUID,
    min_score: float | None = None,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_scoped_db),
):
    """Export the ranked shortlist as a CSV."""
    import csv
    import io

    from fastapi.responses import Response

    job = await pipeline.get_job_or_404(db, job_id, user.org_id)
    results = await pipeline.list_matches_for_job(db, job, min_score=min_score)
    resumes = {r.id: r for r in (await db.scalars(select(Resume).where(Resume.job_id == job.id))).all()}

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Candidate Name", "Score", "Matched Skills", "Missing Skills", "Rationale"])

    for match in results:
        resume = resumes.get(match.resume_id)
        name = resume.candidate_name if resume else "Unknown"
        writer.writerow([name, match.score, ", ".join(match.matched_skills), ", ".join(match.missing_skills), match.rationale])

    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="shortlist_{job_id}.csv"'},
    )


@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_job(
    job_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_scoped_db),
) -> None:
    """Delete a job posting (org-scoped).

    Cascades at the database level to the job's resumes, match results,
    and batch jobs. Audited as ``job_deleted`` for DPDP traceability.
    """
    job = await pipeline.get_job_or_404(db, job_id, user.org_id)
    await retention.log_audit_event(
        db,
        org_id=user.org_id,
        resume_id=None,
        event_type="job_deleted",
        actor_type="user",
        actor_user_id=user.id,
        event_metadata={"job_id": str(job.id), "job_title": job.title},
    )
    await db.delete(job)
    await db.commit()
    logger.info("job_deleted job_id=%s org_id=%s actor_user_id=%s", job.id, user.org_id, user.id)
