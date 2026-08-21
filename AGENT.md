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
- **Migrations**: Alembic (to be set up in a later task)
- **Validation**: Pydantic v2 + pydantic-settings
- **Logging**: structlog (JSON in production, console in development)
- **LLM/Embeddings**: Provider-agnostic client abstraction (see `src/merix/clients/`)
- **Package manager**: uv
- **Testing**: pytest + pytest-asyncio
- **Linting/Formatting**: ruff

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

## How to Update This File

When the project evolves:
1. Add new conventions or decisions to the appropriate section
2. Update stack decisions if libraries change
3. Keep operating principles verbatim (do not modify)
4. Commit changes with `docs: update AGENT.md`
