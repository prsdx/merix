# Merix Agent Guidelines

This document is the persistent house-style guide for all AI-assisted development on Merix. Read it before making any changes.

---

## Operating Principles

1. Study how established products (Greenhouse, Lever, Eightfold, standard ATS/SaaS backends) solve a problem before designing a solution. Adopt proven patterns and conventions rather than inventing your own.
2. Do not preserve backward compatibility with the current hackathon code. Remove obsolete paths instead of adding compatibility layers, fallbacks, or migrations for old code.
3. Choose the simplest implementation that fully meets the current requirement. Avoid speculative abstractions, configuration, or indirection for features we don't have yet.
4. Grow the system in layers. Start from the smallest version that works end to end, and add each new capability on top of something that already works. Never trade a working product for unfinished complexity.
5. Keep components modular with clearly separated concerns.
6. Prefer established, well-maintained libraries when they reduce complexity or improve reliability. Do not reimplement common functionality without a clear reason. Check a library's actual documentation and type definitions before assuming it lacks a capability.
7. Lean on dependencies already in the project before adding new ones or writing custom code.
8. Make architectural decisions for the long term. Do not accept a stopgap that's meant to be replaced later — if something needs to be right, make it right now.
9. Security is not optional at any layer: input validation, secrets handling, auth, dependency hygiene. Treat this as a real product handling candidate PII (India DPDP Act applies).
10. Be cost-conscious with your own tool calls and with any LLM API usage the app will make in production (batch where sensible, avoid redundant calls, cache where appropriate).

---

## Stack Decisions

- **Backend**: Python 3.11+ with FastAPI (async), Uvicorn
- **Database**: PostgreSQL with pgvector extension (via Supabase)
- **ORM**: SQLAlchemy 2.0 (async) with asyncpg driver
- **Migrations**: Alembic (applied automatically on every deploy — the Render start command runs `alembic upgrade head` before Uvicorn; see `render.yaml`)
- **Validation**: Pydantic v2 + pydantic-settings
- **Logging**: structlog (JSON in production, console in development)
- **LLM/Embeddings**: Provider-agnostic client abstraction (see `src/merix/clients/`)
- **Package manager**: uv
- **Testing**: pytest + pytest-asyncio
- **Linting/Formatting**: ruff (line-length = 130; `ruff check` + `ruff format`)
- **CI**: GitHub Actions (`.github/workflows/ci.yml`) — ruff + pytest on every push/PR

---

## Project Structure

```
backend/
├── pyproject.toml
├── .env.example
├── README.md
├── src/
│   └── merix/
│       ├── main.py              # FastAPI app factory + lifespan
│       ├── config.py            # Pydantic-settings (env-based)
│       ├── db.py                # Async engine/session setup
│       ├── dependencies.py      # FastAPI dependencies
│       ├── api/                 # Routes
│       │   ├── router.py        # Aggregate router
│       │   └── v1/              # Versioned endpoints
│       ├── core/                # Security, exceptions, logging
│       ├── models/              # SQLAlchemy models
│       ├── schemas/             # Pydantic request/response schemas
│       ├── services/            # Business logic
│       ├── repositories/        # Data access layer
│       └── clients/             # External provider abstractions
├── tests/
│   ├── conftest.py
│   ├── unit/
│   └── integration/
└── scripts/
```

---

## Conventions

### Naming
- **Files**: snake_case (e.g., `job_repository.py`)
- **Classes**: PascalCase (e.g., `JobRepository`)
- **Functions/variables**: snake_case
- **Constants**: SCREAMING_SNAKE_CASE
- **Database tables**: snake_case plural (e.g., `jobs`, `candidates`)

### Error Handling
- Domain exceptions live in `src/merix/core/exceptions.py`
- Raise domain exceptions in services/repositories
- Convert to HTTP responses via FastAPI exception handlers
- Never leak stack traces or internal details to clients
- Return consistent error shape: `{"error": {"code": "...", "message": "..."}}`

### Logging
- Use `structlog.get_logger()` at module level
- Log at appropriate levels: DEBUG for dev, INFO for requests, WARNING for recoverable errors, ERROR for failures
- Never log PII (resume content, candidate names, emails, phone numbers)
- Include request IDs and tenant/user context in log context

### API Design
- All routes under `/api/v1`
- Use Pydantic schemas for request/response validation
- Use proper HTTP status codes (200, 201, 400, 401, 403, 404, 422, 500)
- Paginate list endpoints (`?page=1&page_size=20`)

### Database
- All SQLAlchemy models in `src/merix/models/`
- All repositories in `src/merix/repositories/`
- Use async sessions via dependency injection
- Never use raw SQL unless necessary (and document why)

### Security
- Never commit secrets; use environment variables
- All user input must be validated with Pydantic
- All file uploads must be validated (type, size, content)
- Auth via JWT
- Row-level security for multi-tenant data (Supabase RLS)

---

## DPDP (India Data Protection) Compliance

Merix processes candidate resumes containing PII. The India Digital Personal Data Protection Act (DPDP) applies:

- **Consent**: Obtain explicit, informed consent before processing. Record consent timestamp, purpose, and scope.
- **Purpose limitation**: Only use resume data for matching to the specific job description the recruiter selected.
- **Data minimisation**: Extract only the fields needed for matching (skills, experience, education). Do not store unnecessary PII.
- **Retention**: Default retention is 90 days. After that, anonymise or delete.
- **Right to erasure**: Candidates (via recruiters) must be able to request deletion.
- **Security**: Encrypt at rest (Supabase default), encrypt in transit (TLS), scrub PII before sending to LLM providers.

---

## Cost-Conscious LLM Usage

### Production rules (baked into the app)
- **Cache aggressively.** Key extraction/matching results by content hash (input text + model + prompt version). Never re-call the LLM for identical input - resume re-uploads are extremely common in batch screening.
- **Extract the JD once.** Parse a JD a single time, store the structured result, and match all resumes against that stored structure. Never re-extract the JD per candidate.
- **Right-size the model.** Use the cheapest model that meets quality. Default to Groq `openai/gpt-oss-120b`; reserve expensive models for hard cases only.
- **Tight, structured prompts.** Request only the fields we need (skills/exp/edu + evidence). Shorter prompts + constrained JSON output = fewer input and output tokens. No filler instructions.
- **Deterministic, capped output.** Use `temperature = 0` and a `max_tokens` cap on all extraction calls.
- **Batch and dedupe.** Process batches through a queue with concurrency limits; dedupe identical resumes within a batch before any LLM call.
- **Truncate safely.** Cap extracted text length (head + tail strategy) so a large PDF doesn't blow up token count. Still scrub PII before sending.
- **Validate locally.** Use Pydantic to validate LLM output before use so you don't pay for blind retry loops.
- **Track tokens per call.** Log prompt/completion token counts as a metric - you can't reduce what you don't measure. Feeds the "LLM cost per batch" PRD success metric.
- **Never send PII to LLM providers** (scrub first).

### Working-session guidance (for you and any AI pair-programmer)
- Read files by absolute path and line-range instead of pasting large content into prompts.
- Scope tasks narrowly; batch several small changes into one task rather than many tiny prompts.
- Ask for targeted diffs, not full-file rewrites, when only part of a file changes.
- Use `CONTEXT.md` as the cheap hand-off for a fresh session; reference `AGENT.md` conventions instead of re-explaining the project.
- Use plan mode for design decisions (cheap, no code churn), act mode for execution.

---

## Git Workflow

### Branch Naming
- `feature/<short-description>` — new features
- `fix/<short-description>` — bug fixes
- `chore/<short-description>` — tooling, deps, cleanup
- `docs/<short-description>` — documentation
- `refactor/<short-description>` — code restructuring

### Commit Messages (Conventional Commits)
- `feat: <description>` — new feature
- `fix: <description>` — bug fix
- `chore: <description>` — tooling, deps
- `docs: <description>` — documentation
- `test: <description>` — tests
- `refactor: <description>` — code restructuring
- `perf: <description>` — performance
- `ci: <description>` — CI/CD changes

Examples:
- `feat: add batch resume matching endpoint`
- `fix: correct weighted scoring formula`
- `chore: upgrade fastapi to 0.115.0`

### Pull Requests
- All changes go through PRs (even solo projects)
- Use the PR template
- Link related issues
- Keep PRs small and focused (<400 lines changed)
- Squash and merge to keep history clean

### Versioning
- Semantic Versioning (MAJOR.MINOR.PATCH)
- Update CHANGELOG.md with every task
- Tag releases in git

---

## CI / Automated Checks

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full CI reference. Summary:

- **Lint job**: `ruff check src/ tests/` + `ruff format --check` — runs first on every push/PR.
- **Test job**: `pytest -v --tb=short` — full test suite (unit + integration); runs after lint passes.
- Integration tests hit the **real Supabase Postgres** instance (not a mock) — RLS correctness requires it.
- Required secrets: `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `SUPABASE_JWT_SECRET`.
- Branch protection (requiring status checks) must be configured manually in GitHub repo settings.

---

## Verification Requirement (standing rule — applies to every step, not just the end)

Do not mark any step as done just because the code was written or the file compiles. For each step, before moving to the next:

- Actually run it (start the server, hit the endpoint, run the test) and show real output — not a description of expected behavior.
- If a step touches something built in a previous step (e.g. matching logic calling the embedding client), re-verify the previous step still works after the change — don't assume it's untouched.
- If something fails, fix it before moving on. Do not proceed to the next step with a known-broken or unverified previous step, and do not say something works if it hasn't actually been executed.
- At each status update, include what was run and what it returned, not just what was built.

---

## Commit Discipline (standing rule)

- Commit at each meaningful, working checkpoint — not just at the end of a task. A "meaningful checkpoint" means: a step from the task's scope is built AND verified working (per the verification requirement above). Do not batch multiple unrelated changes into one giant commit.
- Follow the Conventional Commits convention (feat:, fix:, chore:, test:, docs:, refactor:) — one logical change per commit, not one commit per task.
- Every commit must correspond to a working state — never commit code that doesn't run or that hasn't been verified, per the verification rule above. Broken intermediate states belong in the working tree, not in a commit.
- Use the branch naming convention for each task's work (e.g. feature/<short-description>) — do not commit directly to main.
- At each status update, state what was committed, not just what was built.
- Retroactively: if there are uncommitted changes sitting from work already done, stop, review them, and commit them properly in logical chunks before continuing — don't fold old uncommitted work into the next new commit.

---

## Migration Discipline (standing rule)

- Any Alembic migration added to the codebase must be applied to the actual production database as part of the same task that introduces it. "The migration file exists in the repo" is **not** the same as "done."
- Before considering any schema-changing task complete, verify that `alembic current` matches `alembic heads` against production — not just the one column/table you touched.
- In deploys, migrations must run before the app starts (`alembic upgrade head` chained into Render's start command, or as a Pre-Deploy Command once on a paid plan). Never ship model/code changes that assume a schema the deployed database doesn't have yet.

---

## Knowledge Graph (graphify)

This project has a knowledge graph at `graphify-out/` with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when `graphify-out/graph.json` exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Read `graphify-out/GRAPH_REPORT.md` only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost). A post-commit hook also rebuilds it automatically on every commit.

---

## How to Update This File

When the project evolves:
1. Add new conventions or decisions to the appropriate section
2. Update stack decisions if libraries change
3. Keep operating principles verbatim (do not modify)
4. Commit changes with `docs: update AGENT.md`
