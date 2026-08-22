# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Task 9: Full production frontend implementation (Next.js App Router + TypeScript + Tailwind + Framer Motion)
  - **Design System & Palette**: Unified across all 9 core user journey screens using the v5 high-converting B2B SaaS conversion structure and v7 Apple Liquid Glass deep dark `#050505` aesthetic with frosted glass panels (`bg-white/[0.03] backdrop-blur-2xl border border-white/10`) and violet/blue data accents.
  - **Screen 1 (Landing Page, `/`)**: Centered hero with dual CTAs, live product preview card, social proof trust band, 3-pillar feature zigzag (Explainability, Async Batch Processing, India DPDP 2023 Compliance), ROI metrics strip, and responsive navigation.
  - **Screen 2 (Auth, `/login`, `/signup`)**: Infrastructure-minimal, org-based signup and login with Supabase GoTrue JWT session management, error handling, and Auth Context.
  - **Screen 3 (Dashboard, `/dashboard`)**: Active jobs list with resume counts, match status, search filter, metric cards, and a guided empty state.
  - **Screen 4 (Post a Job, `/jobs/new`)**: Semantic JD parser form with live sample technical JD generator calling `POST /api/jobs`.
  - **Screen 5 (Batch Upload, `/jobs/[jobId]/upload`)**: Drag-and-drop batch PDF ingestion with prominent **DPDP Consent Gate UI** (explicit legal consent affirmation required before upload) calling `POST /api/jobs/{id}/resumes`.
  - **Screen 6 (Job Processing Status, `/jobs/[jobId]/status/[batchJobId]`)**: Real-time progress bar polling `GET /api/batch-jobs/{id}` (every 1.5s) with partial failure breakdown.
  - **Screen 7 (Ranked Shortlist, `/jobs/[jobId]/results`)**: Ranked candidates with match score (0-100), matched & missing skills at a glance, score threshold filters (All, 80+, 70+, 60+), search, and direct CSV download via `GET /api/jobs/{id}/matches/export`.
  - **Screen 8 (Candidate Detail Drill-down, `/jobs/[jobId]/candidates/[matchId]`)**: 70/20/10 weighted score breakdown, verbatim AI rationale, skill matrix with resume quotes, and DPDP Right to Erasure (`DELETE /api/candidates/{id}`).
  - **Screen 9 (Settings & Compliance, `/settings`)**: Org profile, DPDP Retention Policy editor (GET/PATCH `/api/orgs/me`), live immutable audit log view (`GET /api/orgs/audit-logs`), and ATS Integration placeholders.
  - **Backend API Additions**: Added `GET /api/jobs` (list all org jobs with resume/match counts) and `GET /api/orgs/audit-logs` (list audit events).
  - **Verification**: End-to-end live testing across all 11 backend and frontend endpoints passing cleanly.

- Task 7: Production deployment configuration & health check
  - **Render Blueprint** (`render.yaml`): Web Service specification for FastAPI backend on Python 3.11 with `uv` package manager (`uv sync --frozen`, `uv run uvicorn merix.main:app --host 0.0.0.0 --port $PORT`).
  - **Health check** (`/health`, `/ready`, `/api/health`): Root and `/api` health endpoints verifying application liveness and Postgres database connectivity (`SELECT 1`).
  - **Cold-start guidance**: Documented ~30-60s cold-start behavior for Render free tier (spin down on 15m inactivity) and recommended `/health` pre-warming for live demos.
  - **Demo data isolation convention**: Pre-launch shared Supabase environment uses dedicated tagged demo organisation with PostgreSQL RLS isolation to preserve pitch demo data.
  - **Tests**: 3 new integration tests covering `/health`, `/api/health`, and `/ready` endpoints (56 integration + unit tests total).

- Task 6: CI pipeline (GitHub Actions)
  - **Workflow** (`.github/workflows/ci.yml`): lint job (`ruff check` + `ruff format --check`) followed by test job (`pytest -v --tb=short`) on every push to main/feature/fix/chore/refactor/docs branches and every PR against main
  - **Two-job design**: `Lint (ruff)` runs first with no secrets; `Test (pytest)` runs after (`needs: lint`) against the real Supabase Postgres DB (RLS correctness tests require real Postgres behavior — not a mock or local container)
  - **Secrets**: `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `SUPABASE_JWT_SECRET` — never hardcoded, passed via GitHub Actions secrets
  - **Ruff config**: bumped line-length 88→130 to match actual code style; cleared 35 auto-fixable violations (trailing newlines, unused import in test_rate_limit.py)
  - **README.md**: CI status badge (main branch)
  - **CONTRIBUTING.md**: new file documenting CI jobs, required secrets, branch protection configuration steps, and local dev commands
  - **AGENT.md**: stack decisions updated (Migrations, ruff line-length + CI entry); CI section added before Verification Requirement

### Changed
- ruff `line-length` 88 → 130 in `pyproject.toml`; added `[tool.ruff.format]` section

### Task 5: Background job robustness (async batch matching with status tracking)
  - **BatchJob model**: status lifecycle (queued→running→completed/failed), org_id, job_description_id, idempotency_key (optional UUID for deduplication), total_resumes, completed_resumes (progress tracking), batch_results (JSONB array of per-resume disposition), error_message (for failed jobs)
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

- Task 4: Security hardening pass
  - **Dependency audit**: pip-audit on backend — 0 known CVEs; npm audit on frontend — 0 (Vite CVEs already fixed)
  - **Secrets review**: no hardcoded credentials in git history or current codebase; .env.example now covers all config vars including ADMIN_API_TOKEN and ALLOWED_ORIGINS
  - **Input validation hardening**: capped upload reads (MAX_FILE_BYTES+1), Field max_length on all schemas, PDF page cap (100 pages), admin-token sweep gate — 6 tests
  - **Rate limiting**: slowapi on signup (5/hour) and login (10/minute) per client IP — 2 tests
  - **CORS**: ALLOWED_ORIGINS env var (comma-separated, defaults to `"*"` in dev); CORSMiddleware with allow_credentials=True
  - **Logging review**: all 8 logger calls audited — no PII (emails, tokens, resume content) logged
  - **RLS GUC bleed-through tests**: rapid sequential alternation (no cross-org leak) + SESSION-scoped variant (documents where a connection-pool regression would surface)

### Fixed
- InsecureKeyLengthWarning: test HMAC key now ≥ 32 bytes (test-only fix; real JWT_SECRET length is user-supplied)
- RLS policy for organisations/users: migration `26f49b7b8456` grants merix_app full access (RLS was on but had no app policy, breaking signup under the app role)

### Changed
- Retention sweep gated behind ADMIN_API_TOKEN when configured (X-Admin-Token header, 403 otherwise)
- Retention period removed from Task 5 "known gaps" — now scheduled for background-job robustness in Task 5

### Task 3: DPDP consent / retention / erasure / audit log
  - Resume upload requires explicit `consent_given=true` (400 otherwise); consent timestamp and retention expiry stamped server-side from the org's retention policy (never trusts client clocks)
  - Per-org retention policy: `organisations.retention_days` (default 90); GET/PATCH `/api/orgs/me` to read/update (validated 1-3650 days)
  - Append-only `audit_events` table (survives resume deletion via SET NULL FK) with FORCE RLS + org_isolation policy, same pattern as tenant tables
  - Retention service: hard-delete with audit trail, per-org sweep (`sweep_all_orgs`), DELETE `/api/candidates/{resume_id}` (data-principal erasure right), POST `/api/admin/retention-sweep` background trigger
  - Migration `2072dab8609b` (applied to live DB): audit_events + RLS, organisations.retention_days
  - 5 new integration tests; org-isolation and vertical-slice tests updated for the consent field - 37 tests total

### Changed
- Retention period moved from global env (`DATA_RETENTION_DAYS`, removed) to per-org DB setting `retention_days`
- Resume upload: `candidate_name` and `consent_given` are now multipart Form fields (were query params / absent)

### Fixed
- Stale org-isolation test: resume upload now sends `consent_given` so the request reaches the org check (404) instead of failing form validation (422)

### Task 2: Auth + multi-tenancy (Supabase Auth + Postgres RLS)
  - Supabase Auth (GoTrue) identity: `clients/auth.py` minimal httpx client (admin create/delete user, password grant); signup = org + auth identity + profile in one flow
  - Local HS256 verification of GoTrue access tokens (`core/security.py`); `/api/auth/signup`, `/api/auth/login`, `/api/auth/me`
  - Organisation + User models; `org_id` NOT NULL FK on job_descriptions/resumes/match_results (Task 1 NULL-org test data discarded)
  - Row-level security: FORCE RLS + `org_isolation` policy on tenant tables; app connects via `SET ROLE merix_app` and pins `app.current_org_id` per transaction; unset context fails closed
  - All Task 1 routes now require auth and auto-scope to the caller's org; cross-org access returns 404 (no existence leak); 401 for missing/invalid/expired tokens
  - 18 new integration tests: six 401 auth failure paths, signup/login flows, org isolation at API and DB (RLS) layers - 32 tests total
  - Verified live: two real GoTrue signups, full Org A pipeline, Org B 404 on all Org A resources

### Fixed
- Signup org PK flush (org.id was None when referenced as user FK)
- RLS policy empty-string-safe (`current_setting(..., true)` returns '' not NULL; `NULLIF` so unset context fails closed instead of raising)
- `GRANT merix_app TO postgres` in migration (`SET ROLE` requires role membership)

### Known issue
- New Supabase projects sign access tokens with ES256; local verifier is HS256-only. Production fix: JWKS verification (tracked in CONTEXT.md).

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

### Changed
- Task 1 follow-up: default embedding provider switched from OpenAI (account had no quota) to **Google Gemini** `gemini-embedding-001` at `output_dimensionality=768`; added provider factory `get_embedding_client(provider=...)`; embedding columns migrated 1536 -> 768

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
