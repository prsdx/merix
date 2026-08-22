# Contributing to Merix

## What runs automatically (CI)

Every push and pull request against `main` triggers the [CI workflow](.github/workflows/ci.yml), which runs two jobs in sequence:

| Job | What it runs | When it blocks merge |
|-----|-------------|----------------------|
| **Lint** | `ruff check src/ tests/` + `ruff format --check src/ tests/` | Required (must pass) |
| **Test** | `pytest -v --tb=short` (all 53 tests, unit + integration) | Required (must pass) |

The **Test** job only runs if **Lint** passes (via `needs: lint`).

### Why the full integration test suite in CI?

Integration tests run against the real Supabase Postgres instance (not a mock). This is intentional — org-isolation (RLS) tests and scoped-session tests exercise real Postgres row-level security. Faking the DB would defeat the purpose of those tests entirely.

---

## What still needs manual verification

- **LLM quality**: the suite uses `FakeLLM`/`FakeEmbedder` — real provider calls (Groq, Gemini) are not tested in CI.
- **Alembic migrations**: migrations are applied to the live Supabase DB manually (`alembic upgrade head`) — there is no automated migration-check step in CI yet.
- **Frontend**: React SPA in `frontend/` has no CI coverage yet.
- **GoTrue ES256 tokens**: production Supabase tokens use ES256; our verifier is HS256-only. This is a known gap (tracked in CONTEXT.md).

---

## Running CI checks locally

```bash
cd backend

# Lint
uv run ruff check src/ tests/
uv run ruff format --check src/ tests/

# Auto-fix lint issues
uv run ruff check --fix src/ tests/
uv run ruff format src/ tests/

# Tests (requires .env with valid DATABASE_URL and SUPABASE_JWT_SECRET)
uv run pytest -v --tb=short
```

---

## GitHub secrets required for CI

The following secrets must be set in **Repository Settings → Secrets and variables → Actions**:

| Secret | Where to find it |
|--------|-----------------|
| `DATABASE_URL` | Supabase project → Settings → Database → Connection string (asyncpg format) |
| `SUPABASE_URL` | Supabase project → Settings → API → Project URL |
| `SUPABASE_SERVICE_KEY` | Supabase project → Settings → API → `service_role` key |
| `SUPABASE_JWT_SECRET` | Supabase project → Settings → API → JWT Secret |

---

## Branch protection (recommended — must be set manually)

Tests blocking merge requires a **Branch Protection Rule** on `main`:

1. Go to **Repository Settings → Branches → Add rule**
2. Branch name pattern: `main`
3. Enable **Require status checks to pass before merging**
4. Add `Test (pytest)` and `Lint (ruff)` as required checks
5. Enable **Require branches to be up to date before merging**
6. Enable **Do not allow bypassing the above settings** (optional but recommended)

This cannot be done by code — it requires repo admin access in the GitHub UI.

---

## Commit and branch conventions

See [AGENT.md](AGENT.md) for the full Git workflow (branch naming, Conventional Commits, PR rules).
