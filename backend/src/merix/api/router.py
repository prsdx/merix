"""Aggregate API router."""

from fastapi import APIRouter

from merix.api.v1 import admin, auth, batch_jobs, candidates, health, jobs, matches, orgs

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(orgs.router, prefix="/orgs", tags=["orgs"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(jobs.router, prefix="/jobs", tags=["jobs"])
api_router.include_router(candidates.router, prefix="/candidates", tags=["candidates"])
api_router.include_router(matches.router, prefix="/matches", tags=["matches"])
api_router.include_router(batch_jobs.router, prefix="/batch-jobs", tags=["batch-jobs"])
