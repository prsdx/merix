# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Task 1: Core resume-to-JD matching pipeline (end-to-end vertical slice)
  - SQLAlchemy models: JobDescription, Resume, MatchResult (explainability: matched_skills, missing_skills, rationale; DPDP fields on Resume; pgvector embeddings)
  - Alembic migrations (initial schema + embedding dim 1536) applied to Supabase Postgres
  - PDF text extraction service (PyMuPDF) with input validation (5MB, magic bytes, corrupt/encrypted/scanned rejection) and PII scrubbing
  - Provider-agnostic clients: GroqLLMClient, OpenAIEmbeddingClient (token-usage logging)
  - Matching service: LLM structured extraction, deterministic weighted scoring (70/20/10), LLM rationale
  - Pipeline orchestrator + REST API (jobs, resume upload, batch match, ranked shortlist, single match)
  - Domain-exception-to-HTTP mapping (404/413/415/422/409/400)
  - 17 tests (unit + integration)

### Added
- Task 0: Project scaffolding
  - FastAPI backend structure (`backend/`) with modular separation
  - Provider-agnostic LLM/embedding/storage client protocols
  - AGENT.md with house style and conventions
  - CONTEXT.md with project context
  - PRD.md with v1 product requirements
  - Git workflow documentation (branch naming, Conventional Commits)
  - GitHub templates (PR, issue templates)
  - CHANGELOG.md

### Removed
- Old hackathon code (`app.py`, `server.py`, `main.py`, `embed_out.py`, `extract_text.py`, `jd_function.py`, `resume_function.py`)
- Old deployment configs (`Dockerfile`, `render.yaml`, `hf-space/`, `deploy/`)
- Old requirements files
