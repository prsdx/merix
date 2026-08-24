# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Task 12: Link parsing — evidence anchors extracted before PII scrub**
  - New `services/links.py`: extracts links from resume PDFs from two sources — hyperlink annotations (`page.get_links()`, captures real hrefs even when display text differs) and the text layer (catches scheme-less forms like `linkedin.com/in/jane`, `github.com/user/repo`).
  - Normalisation: adds missing `https://`, lowercases scheme/host, strips tracking params (`utm_*`, `fbclid`, …), trims prose-swallowed trailing punctuation while preserving balanced-paren URLs, validates host shape. Classification: linkedin / github / gitlab / bitbucket / portfolio / blog / other.
  - Pipeline wiring: `upload_resume` calls `collect_links()` **before** `scrub_pii` destroys the text; links flow through `process_resume_background` → `pipeline.add_resume` and persist in `Resume.parsed["links"]` as `[{"url", "type"}]` (JSONB, no migration). The LLM never sees the raw URLs.
  - Never fails an upload: link extraction swallows internal errors and returns [].
  - Tests: `tests/unit/test_links.py` (11 tests) covering normalisation, classification, dedupe, annotated-PDF extraction, and garbage-input safety.
- **Task 12b: Timeline reconstruction — deterministic work-history analysis**
  - `_RESUME_EXTRACT_PROMPT` now also returns `timeline`: raw work-history entries (`{company, title, start, end}`) with dates verbatim as written.
  - New `services/timeline.py` (pure functions, no LLM): parses year values ("Jan 2019" → 2019; "Present" → current year; explicit year beats present-words; word-boundary matching so "unknown" ≠ "now"), builds tenure spans, computes total experience as a **union of tenures** (concurrent roles don't double-count), detects overlapping roles and employment gaps (≥6 months), and flags implausible ranges / unparseable dates instead of failing.
  - Stored in `Resume.parsed["timeline_analysis"]` by `pipeline.add_resume` — the LLM's self-reported `experience_years` is no longer the only experience signal.
  - Tests: `tests/unit/test_timeline.py` (9 tests).
- **Task 12c: JD-from-URL ingestion with SSRF guards**
  - New dependency `trafilatura` (HTML→text extraction).
  - New `services/jd_fetch.py`: fetches a job-posting URL and extracts plain text + title. SSRF posture: http(s) only; every hop's hostname DNS-resolved and **all** resolved IPs must be public (loopback/private/link-local/reserved rejected); redirects followed manually (max 3) with re-validation per hop; 10s timeout; 1 MiB body cap. Domain policy: career-board hosts (`greenhouse.io`, `lever.co`, `ashbyhq.com`) always allowed, boundary-aware suffix matching (`notgreenhouse.io` is rejected); arbitrary domains gated behind `JD_FETCH_ALLOW_ANY_DOMAIN=true`.
  - New endpoint `POST /api/jobs/from-url` (`JobFromURLCreate{url, title?}`) reusing `pipeline.create_job`; title derived from page metadata when omitted. Registered before `/{job_id}` routes so "from-url" never parses as a UUID.
  - Tests: `tests/unit/test_jd_fetch.py` (9 tests) using `httpx.MockTransport` + stubbed DNS — no real network in CI.
- **Task 12d: Evidence Graph surfaced in API + candidate UI**
  - New org-scoped endpoint `GET /api/jobs/{job_id}/resumes/{resume_id}` (404 without existence leak, matching house pattern).
  - Frontend: new `api.getResume()`; `Resume.parsed` typed with `links` (`ResumeLink`) and `timeline_analysis` (`TimelineAnalysis`).
  - Candidate detail page gains an **Evidence Graph** card: career timeline (spans with CURRENT badge, union-based total experience, concurrent-role and timeline-flag warnings) plus profile-link chips with type icons (LinkedIn/GitHub/portfolio/blog/other), rendered in existing Chai design tokens. Card hidden when a resume has neither.
- **Task 13: Link verification — authenticity layer (flag, don't reject)**
  - New `services/verify.py`: after a resume is processed, links are liveness-checked (HEAD with GET fallback; 404/410 → `dead`, 403 bot-walls → `unknown`, network errors → `error`) and GitHub profile URLs get an existence check via `api.github.com/users/{u}` — API 404 marks the link **`fabricated`**. Non-allowlisted hosts are `skipped` entirely.
  - SSRF posture: only allowlisted profile hosts are probed, and the DNS all-public-IPs guard from `jd_fetch` runs before every request. New setting `LINK_VERIFY_ENABLED` (default true) to switch off outbound checks.
  - Results stored in `Resume.parsed["link_verification"]` via `flag_modified` (explicit JSONB dirty-marking); verification failures are logged and swallowed — never fail the upload job.
  - Frontend: status dots on link chips (green live / red dead-or-fabricated / amber inconclusive / grey not checked) with tooltip explanations.
  - Tests: `tests/unit/test_verify.py` (10 tests, mocked transport + stubbed DNS).




### Changed
- **Task 11: Backend performance pass — connection pooling**
  - `db.py`: select pool class by `ENVIRONMENT` — `AsyncAdaptedQueuePool(pool_size=5, max_overflow=10, pool_pre_ping=True)` in **production**, NullPool otherwise.
  - Root cause of 3–6s GETs: prior NullPool opened two fresh TLS connections to Supabase per request (auth lookup + scoped session) plus one per `/health` poll, each paying TCP+TLS+asyncpg handshake on a throttled free-tier container.
  - RLS safe: `SET ROLE merix_app` connect-hook persists harmlessly (every connection wants merix_app); org GUC stays **transaction-local** (`set_config(..., true)` re-applied by `after_begin` on every transaction). NullPool stays for dev/test (cross-event-loop reuse breaks pooled conns under pytest-asyncio).
  - Verified with `scripts/verify_pooled_rls.py`: 30 alternating-org rounds × 2 sessions under pooling, zero cross-org leak.
- **Task 11: Resume upload is now asynchronous** (contract change)
  - `POST /api/jobs/{id}/resumes` now validates synchronously (org-scoped 404, DPDP consent gate 400, size cap 413, PDF validation 422 — identical errors as before), persists a `BatchJob(total_resumes=1)`, and returns **202 Accepted** with its `BatchJobStatus`.
  - Slow LLM extraction + embedding moved to `process_resume_background` in `services/batch.py`, reusing Task 5's BatchJob pattern (own RLS-pinned scoped session, rollback-safe failure marking). No schema changes; consent timestamping still server-side.
  - Frontend upload flow polls `GET /api/batch-jobs/{id}` every 1.5s (queued → uploading → AI Processing → success/error) instead of blocking on the request.
  - One uvicorn worker retained (Render free tier 512MB / 0.1 CPU): extra workers risk OOM and add no throughput at 0.1 CPU — latency cause was not worker count.
  - `/health` every-5s polling originates externally (Render platform check / uptime keep-warm pinger); kept as-is — pooling makes each ping nearly free.

- Task 10: Unified design system to canonical **"Graphify Precision"** palette across all 9 screens (single source of truth in `globals.css` design tokens — token names preserved, values swapped, zero downstream churn):
  - **Light mode**: White/Soft-Slate canvas (`#FFFFFF` / `#F8FAFC`), Cobalt Blue primary `#2563EB`, Teal evidence `#0D9488`, Amber gap `#D97706`, Red danger `#DC2626`, Slate ink text.
  - **Dark mode**: Obsidian canvas `#0A0E1A`, Bright Blue `#3B82F6`, Luminous Mint `#2DD4BF`, Rose danger `#F87171`.
  - **Typography**: Headlines unified to bold Inter sans with tight tracking (`.font-display` now sans, weight 700); removed DM Serif Display dependency entirely. JetBrains Mono retained for evidence/data.
  - **Cleanup**: Removed dead Tailwind config aliases (`ink`, `parchment`, `surface`, `data`, `compliance`, `score`, `iris`, glass shadows) pointing at nonexistent variables; fixed `LiquidBackground` orbs to use live tokens; fixed `<body>` classes in root layout; updated `ScoreRing` color fallbacks.

### Added
- Task 9: Full production frontend implementation & design upgrade (Next.js 15 App Router + TypeScript + Tailwind + Framer Motion)
  - **Design Read & Palette (Editorial Authority Direction)**: Departed from generic violet/indigo SaaS gradients. Implemented high-contrast `#070709` ink background, `#E8E6E1` warm parchment text, `#00D4AA` teal-cyan precision data accent, `#22C55E` emerald DPDP compliance indicators, and amber-to-emerald score spectrum.
  - **Typography**: `@fontsource/dm-serif-display` for authoritative headlines, `@fontsource/jetbrains-mono` for verbatim resume evidence citations and audit log records, and Inter for crisp UI controls.
  - **Core Interactive Components**:
    - `ScoreRing`: Animated radial SVG progress ring with glow filter, JetBrains Mono readout, and score color thresholds (80+ emerald, 60-79 amber, <60 orange).
    - `CountUp`: Viewport-triggered animated metric counters utilizing Framer Motion for high-impact trust metrics.
    - `DPDPBadge`: 5 standardized compliance markers (pill, subtle, banner, row, stamp) threaded through every candidate touchpoint.
  - **9 Production Screens (Fully Integrated to Backend API)**:
    - **Screen 1 (Landing Page, `/`)**: Asymmetric hero with live interactive deterministic match sandbox simulator, trust band with tier-1 Indian academic institutions, proof strip with animated counters, 3-pillar architectural zigzag, 5-dimension comparison table vs legacy keyword ATS, ROI efficiency calculator, testimonials with Indian campus placement roles, DPDP compliance FAQ, and closing CTA.
    - **Screen 2 (Auth, `/login`, `/signup`)**: Two-pane trust-forward layout with organization creation, Supabase GoTrue JWT session management, row-level security isolation context, and form validation.
    - **Screen 3 (Dashboard, `/dashboard`)**: Active pipeline metrics with animated counters, search filter, job cards with DPDP row badges, resume/match counts, and 3-step guided empty state.
    - **Screen 4 (Post a Job, `/jobs/new`)**: Semantic JD parser form with live sample technical JD generator calling `POST /api/jobs` and live structured extraction preview.
    - **Screen 5 (Batch Upload, `/jobs/[jobId]/upload`)**: Drag-and-drop batch PDF ingestion with prominent **DPDP Consent Gate Card** (explicit legal consent affirmation required before upload) calling `POST /api/jobs/{id}/resumes`.
    - **Screen 6 (Job Processing Status, `/jobs/[jobId]/status/[batchJobId]`)**: Real-time progress bar polling `GET /api/batch-jobs/{id}` (every 1.5s) with partial failure breakdown and itemized candidate stream.
    - **Screen 7 (Ranked Shortlist, `/jobs/[jobId]/results`)**: Flagship candidate data table with radial `ScoreRing` centerpieces, verified skill tags, missing gap chips, score threshold filters (All, 80+, 70+, 60+), search, and direct CSV export via `GET /api/jobs/{id}/matches/export`.
    - **Screen 8 (Candidate Detail Drill-down, `/jobs/[jobId]/candidates/[matchId]`)**: 70/20/10 weighted score breakdown bar chart, verbatim AI rationale, skill matrix with resume quotes, DPDP compliance stamp, and DPDP Candidate Right to Erasure modal (`DELETE /api/candidates/{id}`).
    - **Screen 9 (Settings & Compliance, `/settings`)**: Org profile, DPDP Retention Policy editor (GET/PATCH `/api/orgs/me`), live immutable audit log view (`GET /api/orgs/audit-logs`), and ATS Integration placeholders.
  - **Verification**: Next.js 15 production build passes with exit code 0 across all 9 static and dynamic routes. Backend test suite passing cleanly.

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
