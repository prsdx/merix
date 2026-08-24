"""Batch job service: background task for async match processing.

Creates its own DB session and LLM client so it is fully independent
of the request lifecycle. Updates the BatchJob row with progress and
per-resume disposition entries as it works.

Retry policy: failed jobs surface their failure to the client. No
auto-retry. The client must resubmit (POST the match again).
run_match_for_resume is idempotent (upserts), so re-running a
completed job is safe.
"""

import logging
import uuid

from sqlalchemy import select

from merix.clients.base import EmbeddingClient, LLMClient
from merix.clients.embeddings import get_embedding_client
from merix.clients.llm import get_llm_client
from merix.config import settings
from merix.db import scoped_session
from merix.models.batch_job import BatchJob
from merix.models.job import JobDescription
from merix.models.resume import Resume
from merix.services import pipeline

logger = logging.getLogger("merix.services.batch")


async def run_batch_match_background(
    org_id: uuid.UUID,
    job_id: uuid.UUID,
    batch_job_id: uuid.UUID,
    llm: LLMClient | None = None,
) -> None:
    """Run match for every resume on a job and record results on the BatchJob.

    Creates a fresh scoped session (RLS-pinned to *org_id*). Uses provided llm client or creates a new one.
    """

    session = scoped_session(org_id)
    if llm is None:
        llm = get_llm_client(api_key=settings.LLM_API_KEY, model=settings.LLM_MODEL)

    try:
        batch_job = await session.get(BatchJob, batch_job_id)
        if batch_job is None:
            logger.error("batch_job_not_found id=%s", batch_job_id)
            return

        batch_job.status = "running"
        await session.commit()

        job = await session.get(JobDescription, job_id)
        if job is None:
            raise ValueError(f"Job {job_id} not found")

        resumes = (await session.scalars(select(Resume).where(Resume.job_id == job_id))).all()

        batch_results: list[dict] = []
        completed = 0
        succeeded = 0

        for resume in resumes:
            try:
                await pipeline.run_match_for_resume(session, llm, job, resume)
                succeeded += 1
                batch_results.append(
                    {
                        "resume_id": str(resume.id),
                        "status": "completed",
                        "error": None,
                    }
                )
            except Exception as exc:
                logger.exception("match_failed resume_id=%s", resume.id)
                batch_results.append(
                    {
                        "resume_id": str(resume.id),
                        "status": "failed",
                        "error": str(exc),
                    }
                )

            completed += 1
            # Re-fetch inside the loop because run_match_for_resume commits.
            batch_job = await session.get(BatchJob, batch_job_id)
            batch_job.completed_resumes = completed
            batch_job.batch_results = batch_results
            await session.commit()

        batch_job = await session.get(BatchJob, batch_job_id)
        if resumes and succeeded == 0:
            # Every resume failed: reporting "completed" with an empty shortlist
            # hides the outage behind a success state. Surface it as failed so
            # the frontend stops showing a green path to zero results.
            batch_job.status = "failed"
            batch_job.error_message = (
                f"All {len(resumes)} resume(s) failed processing — see batch_results for per-resume errors"
            )
            logger.error("batch_match_all_failed job_id=%s resumes=%d", job_id, len(resumes))
        else:
            batch_job.status = "completed"
        await session.commit()

        logger.info("batch_match_completed job_id=%s resumes=%d succeeded=%d", job_id, completed, succeeded)

    except Exception as exc:
        logger.exception("batch_match_failed job_id=%s", job_id)
        try:
            # The session may be sitting in a failed transaction (e.g. the
            # exception came out of a commit); roll back before reusing it to
            # mark the failure, otherwise the marking itself fails silently
            # and the job stays "running" until the stale timeout.
            await session.rollback()
            batch_job = await session.get(BatchJob, batch_job_id)
            if batch_job is not None:
                batch_job.status = "failed"
                batch_job.error_message = str(exc)
                await session.commit()
        except Exception:
            logger.exception("failed_to_mark_batch_failed")
    finally:
        await session.close()


async def process_resume_background(
    org_id: uuid.UUID,
    job_id: uuid.UUID,
    batch_job_id: uuid.UUID,
    *,
    raw_text: str,
    original_filename: str,
    candidate_name: str | None = None,
    llm: LLMClient | None = None,
    embedder: EmbeddingClient | None = None,
) -> None:
    """Process one uploaded resume (LLM extraction + embedding) in the background.

    Same pattern as run_batch_match_background: creates its own scoped
    session (RLS-pinned to *org_id*) independent of the request lifecycle,
    and updates the BatchJob row so the client can poll status. The upload
    endpoint performs consent + PDF validation synchronously, so this
    function only does the slow work; add_resume's require_consent re-check
    passes trivially with consent_given=True.
    """
    session = scoped_session(org_id)
    if llm is None:
        llm = get_llm_client(api_key=settings.LLM_API_KEY, model=settings.LLM_MODEL)
    if embedder is None:
        embedder = get_embedding_client(
            provider=settings.EMBEDDING_PROVIDER,
            api_key=settings.EMBEDDING_API_KEY,
            model=settings.EMBEDDING_MODEL,
        )

    try:
        batch_job = await session.get(BatchJob, batch_job_id)
        if batch_job is None:
            logger.error("batch_job_not_found id=%s", batch_job_id)
            return

        batch_job.status = "running"
        await session.commit()

        job = await session.get(JobDescription, job_id)
        if job is None:
            raise ValueError(f"Job {job_id} not found")

        resume = await pipeline.add_resume(
            session,
            llm,
            embedder,
            job,
            raw_text=raw_text,
            original_filename=original_filename,
            candidate_name=candidate_name,
            consent_given=True,  # validated synchronously by the endpoint
        )

        # Re-fetch inside this session because add_resume commits.
        batch_job = await session.get(BatchJob, batch_job_id)
        batch_job.status = "completed"
        batch_job.completed_resumes = 1
        batch_job.batch_results = [{"resume_id": str(resume.id), "status": "completed", "error": None}]
        await session.commit()

        logger.info("resume_processed job_id=%s resume_id=%s", job_id, resume.id)

    except Exception as exc:
        logger.exception("resume_processing_failed job_id=%s", job_id)
        try:
            # Roll back a possibly-failed transaction before reusing the
            # session to mark the failure (same reasoning as above).
            await session.rollback()
            batch_job = await session.get(BatchJob, batch_job_id)
            if batch_job is not None:
                batch_job.status = "failed"
                batch_job.error_message = str(exc)
                await session.commit()
        except Exception:
            logger.exception("failed_to_mark_upload_failed")
    finally:
        await session.close()
