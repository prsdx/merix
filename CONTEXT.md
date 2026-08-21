# Merix - Project Context

> Read this file first to get up to speed on Merix without reading the entire codebase. Updated at the end of every task.

---

## What is Merix?

Merix is an AI-powered resume-to-job-description matching platform for Indian recruiters and campus placement teams. It helps recruiters rank candidates against job descriptions with explainable, evidence-grounded match scores.

---

## Who is it for?

- **Primary**: Indian campus placement cells and staffing agencies processing hundreds of resumes per job opening
- **Secondary**: Individual recruiters at Indian companies hiring for technical and non-technical roles

---

## What problem does it solve?

Traditional ATS systems are black boxes: they reject resumes with no explanation, reward keyword-stuffing, and punish strong candidates who phrase things differently. Merix provides:

- **Batch matching**: Upload 100 resumes + 1 JD, get ranked shortlist
- **Explainability**: Every match score shows which skills matched, with verbatim evidence from the resume
- **DPDP compliance**: Consent tracking, data retention, PII handling for Indian data protection law

---

## Current Architecture

**Backend**: FastAPI (async) + PostgreSQL/pgvector (Supabase) + SQLAlchemy 2.0 (async, NullPool) + Alembic (migrations applied)

**Frontend**: React SPA (existing, in `frontend/`)

**Status**: Task 1 complete - core matching pipeline works end-to-end (upload resume + JD -> extract -> embed -> match -> ranked explainable result -> persisted to Postgres). 17 tests passing. Default embedding provider is Google Gemini (gemini-embedding-001, dim 768).

### Project Structure

```
backend/
├── src/merix/        # FastAPI app
│   ├── api/          # Routes (v1)
│   ├── core/         # Security, logging, exceptions
│   ├── models/       # SQLAlchemy models
│   ├── schemas/      # Pydantic schemas
│   ├── services/     # Business logic
│   ├── repositories/ # Data access
│   └── clients/      # LLM/embedding/storage abstractions
├── tests/
└── scripts/
```

---

## What's Been Built

- **Task 0**: Project scaffolding
  - Clean FastAPI backend structure with modular separation (api/services/repositories/clients)
  - Provider-agnostic LLM/embedding/storage client protocols
  - AGENT.md with house style and conventions
  - CONTEXT.md (this file)
  - PRD.md with v1 product requirements
  - Git workflow setup (Conventional Commits, branch naming, CHANGELOG)
  - GitHub templates (PR, issue templates)

- **Task 1**: Core matching pipeline (vertical slice, end-to-end)
  - **Models + schema** (`models/`): JobDescription, Resume, MatchResult. MatchResult carries explainability (matched_skills, missing_skills, rationale). Resume has DPDP fields (consent_given, consent_timestamp, retention_expires_at). pgvector embedding columns (dim 1536). Alembic migrations applied to live Supabase DB.
  - **Text extraction** (`services/extraction.py`): PyMuPDF PDF extraction with input validation (5MB limit, magic bytes, corrupt/encrypted/scanned rejection) and PII scrubbing.
  - **Clients** (`clients/`): GroqLLMClient + embedding clients behind provider-agnostic protocols (LLMClient/EmbeddingClient). Default embedding provider is **Google Gemini** (gemini-embedding-001, dim 768); OpenAI also implemented. Provider factory `get_embedding_client(provider=...)` -> swap providers via `.env` only. Token-usage logging for cost tracking.
  - **Matching** (`services/matching.py`): LLM structured extraction (temp=0) -> deterministic Python skill comparison -> weighted score (required 70% / preferred 20% / experience 10%) -> LLM rationale. Explainable by construction.
  - **Pipeline** (`services/pipeline.py`): orchestrates create_job / add_resume / run_match_for_job / list_matches.
  - **API** (`api/v1/`): POST /api/jobs, GET /api/jobs/{id}, POST /api/jobs/{id}/resumes, POST /api/jobs/{id}/match, GET /api/jobs/{id}/matches, GET /api/matches/{id}. Pydantic validation, domain-exception-to-HTTP mapping (404/413/415/422/409/400).
  - **Tests**: 17 passing (10 unit: matching + extraction; 3 integration: full vertical slice against live DB with fake LLM/embedding clients).

### Known gaps / pending
- **Live Gemini embedding call not yet verified** (waiting on a free Google AI Studio API key in `.env` as EMBEDDING_API_KEY). Code + migration complete and unit/integration-tested with fake embedders; only the real provider call is unverified.
- **OpenAI embedding path implemented but unused** (account has no quota). Available behind the same interface by setting EMBEDDING_PROVIDER=openai.
- **Live Groq LLM call verified** (single call), but not yet exercised through the full API path with a real key.
- No auth/multi-tenancy enforcement (org_id column exists, nullable).
- No consent/retention workflow (schema fields only).
- Embedding dimension is 768 (Gemini). Switching to a provider with a different dim requires an Alembic migration (dim is a column type).

---

## What's Next (Task 2)

Auth + multi-tenancy (JWT, organisations, row scoping by org_id) OR consent/retention workflow (DPDP). Confirm choice before starting.

---

## Key Decisions

- **No backward compatibility** with old hackathon code (removed in Task 0)
- **Provider-agnostic LLM/embedding clients** so we can swap Groq/OpenAI/etc. without touching business logic
- **DPDP-aware from day one**: consent, retention, PII scrubbing
- **Cost-conscious LLM usage**: cache, batch, track tokens
- **Layered architecture**: routes → services → repositories → models

---

## Important Files

- `AGENT.md` — House style and conventions for AI-assisted development
- `PRD.md` — Product requirements and v1 scope
- `CHANGELOG.md` — Per-task history
- `backend/README.md` — Backend setup and dev guide

---

## Historical Context

This project evolved from a TechKriti 2025 hackathon prototype (Glass-Box Recruiter / PRISM). The old code has been removed; only the extraction prompt design (evidence grounding, no hallucination) and matching heuristics (weighted scoring) were preserved as design input for the new implementation.
