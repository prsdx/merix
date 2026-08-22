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

**Status**: Task 5 complete — async batch job infrastructure with status tracking and stale detection

Tasks 1-5 complete. Backend + frontend dependencies audited (0 vulns). Task 5 adds async batch matching: POST /api/jobs/{id}/match now returns 202 immediately and enqueues a background task; GET /api/batch-jobs/{id} for polling with stale detection (10-min threshold). BatchJob model tracks status (queued/running/completed/failed), progress (completed_resumes/total_resumes), and per-resume results (batch_results JSONB for partial failure handling). Stale jobs marked failed on startup and on polling. Idempotency key support for deduplication. BackgroundTasks sufficient (no Celery needed). 53 tests total (14 unit + 39 integration).

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

- **Task 2**: Auth + multi-tenancy (Supabase Auth + Postgres RLS)
  - **Auth provider**: Supabase Auth (GoTrue) - passwords never touch our DB; clients/auth.py is a minimal httpx GoTrue client (admin create/delete + password grant). Signup = org + auth identity + profile in one flow; orphan GoTrue users cleaned up on DB rollback.
  - **Token verification**: local HS256 verify of GoTrue access tokens (core/security.py), aud=authenticated, sub=user UUID -> profile lookup in public.users.
  - **Models/migration**: Organisation + User (id = auth.users UUID, single role per user, single org per user); org_id NOT NULL FK on job_descriptions/resumes/match_results. Task 1 NULL-org test data discarded in the migration (confirmed disposable).
  - **Row-level security**: FORCE RLS + org_isolation policy on all three tenant tables; app connections SET ROLE merix_app (non-superuser, so RLS binds) and pin app.current_org_id per transaction via scoped_session(org_id). Unset context fails closed (NULLIF '' -> NULL). Cross-org access returns 404 (no existence leak), enforced in the pipeline's org filter AND at the DB layer.
  - **API**: POST /api/auth/signup, POST /api/auth/login, GET /api/auth/me. All Task 1 routes now require auth and auto-scope to the caller's org. 401s: missing/invalid/expired token, unknown user.
  - **Tests**: 32 passing (14 unit + 18 integration). New: six 401 auth failure paths, signup/login via in-memory GoTrue fake, Org-B-cannot-access-Org-A via API (all five endpoints), direct RLS proof (scoped session can't SELECT/forge foreign-org rows; unscoped fails closed).
  - **Verified live**: two real GoTrue signups -> real sessions -> Org A full pipeline (score 80.0) -> Org B 404 on job/match/matches; 401 on missing/garbage token. Proof data cleaned up.

- **Task 3**: DPDP consent / retention / erasure / audit
  - **Consent gate** (`services/consent.py`): resume upload requires `consent_given=true` (Form field, 400 ValidationError otherwise). `record_consent` stamps `consent_given`, `consent_timestamp`, and `retention_expires_at` server-side (never trusts client clocks) using the org's retention policy.
  - **Org retention policy** (`models/organisation.py`): `retention_days` per org (default 90, DB column via migration; the old global `DATA_RETENTION_DAYS` env setting was removed - retention is org-level now). GET/PATCH `/api/orgs/me` reads/updates it (PATCH validates 1-3650 days).
  - **Audit log** (`models/audit.py`): append-only `audit_events` table (org_id, nullable resume_id with SET NULL so the trail survives deletion, event_type, actor_type user/system, actor_user_id, JSONB metadata). FORCE RLS + org_isolation policy + grants to merix_app, same pattern as the tenant tables.
  - **Retention/erasure service** (`services/retention.py`): `delete_resume` (hard-delete + audit event), `sweep_expired_for_org` (deletes expired resumes in one org-scoped session so RLS binds), `sweep_all_orgs` (per-org sessions). DELETE `/api/candidates/{resume_id}` = data-principal erasure right (cascades match results, writes `deletion_requested` audit event). POST `/api/admin/retention-sweep` triggers the sweep as a background task.
  - **Migration** `2072dab8609b` (applied to live DB): audit_events table + RLS, organisations.retention_days.
  - **Tests**: 5 new integration tests (consent rejection, consent stamping + 90-day expiry, manual deletion removes resume+matches+audits, retention sweep deletes expired, org retention-policy update). Pre-existing org-isolation and vertical-slice tests updated for the consent field. 37 total passing.

- **Task 4**: Security hardening pass
  - **Dependency audit**: pip-audit across all backend deps — 0 known vulnerabilities. Frontend npm audit — 0 vulnerabilities (Vite CVEs already fixed in chore a4002cf).
  - **Secrets review**: no hardcoded keys/tokens/credentials in git history or current codebase. `.env` is gitignored (confirmed). `.env.example` lists every config var with placeholders only (including ADMIN_API_TOKEN, ALLOWED_ORIGINS). InsecureKeyLengthWarning resolved (test HMAC key ≥ 32 bytes; real JWT_SECRET length is user decision).
  - **Input validation hardening**: capped upload reads (MAX_FILE_BYTES+1 cap), Field max_length on all schemas (title, org_name, password, candidate_name, raw_text, email), PDF page cap (100 pages), admin-token sweep gate. 6 validation tests. No SQL injection surfaces found — all queries use SQLAlchemy parameterized API.
  - **Rate limiting**: slowapi on signup (5/hour) and login (10/minute) per client IP. 2 tests with in-memory GoTrue fake.
  - **CORS**: ALLOWED_ORIGINS env var (comma-separated, defaults to "*" in dev). CORSMiddleware with allow_credentials=True.
  - **Logging review**: all 8 logger calls audited across auth, pipeline, retention, llm, and embeddings modules. No PII (emails, tokens, resume content) logged. Only UUIDs, token counts, and model names.
  - **RLS re-verification**: rapid sequential alternation test (Org A/B sessions interleaved 2× — no cross-org leak); SESSION-scoped GUC variant test documents where a real connection-pool regression would surface. Both pass under NullPool.
  - **RLS policy fix**: Migration `26f49b7b8456` grants merix_app full access to organisations/users tables (RLS was enabled but no app policy existed, breaking signup under the app role).
  - 39 tests total (14 unit + 25 integration): +2 rate-limit tests, +2 RLS bleed-through tests.

- **Task 5**: Background job robustness (async batch matching with status tracking)
  - **BatchJob model** (`models/batch_job.py`): status lifecycle (queued→running→completed/failed), org_id, job_description_id, idempotency_key (optional UUID for deduplication), total_resumes, completed_resumes (progress tracking), batch_results (JSONB array of per-resume disposition), error_message (for failed jobs)
  - **Migration** `13aafa45b687` (applied to live DB): batch_jobs table with RLS policies, grants merix_app full access
  - **Async batch matching**: POST `/api/jobs/{job_id}/match` returns 202 Accepted immediately, creates BatchJob with status="queued", enqueues `run_batch_match_background` via BackgroundTasks
  - **Status endpoint**: GET `/api/batch-jobs/{batch_job_id}` returns current status and progress; stale detection marks jobs failed if running > 10 minutes without update
  - **Background task** (`services/batch.py`): creates own DB session (independent of request), updates status queued→running→completed/failed, processes each resume independently with try/except, tracks progress after each resume, records per-resume results in batch_results JSONB
  - **Partial failure handling**: one bad resume doesn't fail the whole batch; failures recorded in batch_results with specific error; job status is "completed" even if some resumes failed
  - **Stale job detection**: on startup (marks any "running" jobs as failed for server crash recovery); on polling (marks failed if updated_at > 10 minutes ago)
  - **Idempotency**: optional idempotency_key prevents duplicate jobs for the same submission
  - **Retry strategy**: "surface-and-let-client-resubmit" (no auto-retry); client must resubmit failed jobs; `run_match_for_resume` is idempotent (upserts), so re-running is safe
  - **BackgroundTasks evaluation**: still sufficient for current requirements (jobs are short-lived, no distributed workers needed, no job scheduling needed); no Celery/Redis required
  - 14 new integration tests covering submission, status polling, completion, idempotency, partial failure, stale detection, org scoping, authentication - 53 tests total

### Known gaps / pending
- **GoTrue token algorithm**: new Supabase projects sign access tokens with ES256; our verifier is HS256-only (SUPABASE_JWT_SECRET). Production fix: JWKS verification against {SUPABASE_URL}/auth/v1/.well-known/jwks.json - needed before real frontend use.
- **Live Groq LLM call verified** (single call), but not yet exercised through the full API path with a real key.
- Embedding dimension is 768 (Gemini). Switching providers requires an Alembic migration.
- Audit log has no read/query API yet (v1 requirement is the trail itself; an auditor-facing endpoint can come later).

---

## What's Next (Task 6) - CI/CD pipeline

No automated testing or linting runs on PRs. Task 6 should add:

1. **GitHub Actions workflow**: run pytest (unit + integration), ruff (lint + format check), mypy (type checking) on every PR
2. **Pre-commit hooks**: auto-run ruff, mypy locally before commits
3. **Dependency audit**: pip-audit and npm audit in CI to catch CVEs
4. **Database migration check**: verify alembic upgrade works on clean DB
5. **Coverage reporting**: track test coverage with coverage.py, enforce minimum threshold

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
