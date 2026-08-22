# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
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
