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

**Backend**: FastAPI (async) + PostgreSQL/pgvector (Supabase) + SQLAlchemy 2.0 (async) + Alembic (migrations, pending)

**Frontend**: React SPA (existing, in `frontend/`)

**Status**: Task 0 scaffolding complete. No feature code yet.

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

---

## What's Next (Task 1)

- Database models and Alembic migrations (organisations, users, jobs, candidates, resumes, matches)
- Auth endpoints (JWT-based signup/login)
- Basic health/readiness endpoints with real DB connectivity checks

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
