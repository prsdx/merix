# Merix 🚀

[![CI](https://github.com/prsdx/merix/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/prsdx/merix/actions/workflows/ci.yml)

**Merix** is an AI-powered resume-to-job-description matching platform designed for modern recruiters and campus placement teams. 

Unlike traditional ATS systems that act as "black boxes" rewarding keyword-stuffing, Merix provides **explainable, evidence-grounded match scores** by carefully comparing candidates' actual skills against job requirements.

---

## ✨ Features

- **Batch Matching**: Upload a Job Description (JD) and up to 100 resumes in one go. Receive a ranked shortlist of candidates asynchronously.
- **Explainable AI**: Every match score includes exactly which skills were matched, which were missing, and verbatim rationale extracted directly from the candidate's resume.
- **Data Privacy & DPDP Compliance**: Built from day one to comply with the India Digital Personal Data Protection (DPDP) Act. Features explicit consent gates, automatic retention sweepers, and hard-erasure capabilities.
- **Multi-Tenancy**: Fully isolated organizations via PostgreSQL Row-Level Security (RLS) on Supabase.
- **Production-Ready Backend**: Async FastAPI server, robust background task management, and provider-agnostic AI clients (Groq, OpenAI, Google Gemini).

---

## 🏗️ Repository Structure

```text
merix/
├── backend/            # FastAPI backend application
│   ├── src/merix/      # Core application code (API, services, models)
│   ├── tests/          # Pytest integration and unit tests
│   └── README.md       # Backend-specific setup guide
├── frontend/           # React frontend application (SPA)
├── render.yaml         # Blueprint for Render deployment
├── PRD.md              # Product requirements and v1 scope
├── CONTEXT.md          # Detailed project context and current state
└── AGENT.md            # Conventions for AI-assisted development
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Python 3.11+
- [uv](https://github.com/astral-sh/uv) (Extremely fast Python package installer)
- A Supabase Project (for PostgreSQL + pgvector)
- API Keys for Groq (LLM) and Google Gemini (Embeddings)

### Backend Setup
1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```
2. **Install dependencies:**
   ```bash
   uv sync
   ```
3. **Set up Environment Variables:**
   Copy `.env.example` to `.env` and fill in your Supabase connection string and API keys.
   ```bash
   cp .env.example .env
   ```
4. **Apply Database Migrations:**
   ```bash
   uv run alembic upgrade head
   ```
5. **Start the API Server:**
   ```bash
   uv run uvicorn merix.main:app --reload
   ```

*Visit `http://localhost:8000/docs` to explore the interactive API documentation.*

---

## 🌐 Deployment (Render)

Merix is configured to be deployed easily on the **Render** free tier using the included `render.yaml` Blueprint.

1. Connect this repository to your Render account.
2. Select **New Blueprint** and allow Render to sync the configuration.
3. In the Render Dashboard, manually provide values for the secure environment variables (marked as `sync: false`):
   - `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `SUPABASE_JWT_SECRET`
   - `LLM_API_KEY`, `EMBEDDING_API_KEY`
4. The service will build and start automatically. You can verify it's running by pinging the `GET /health` endpoint.

> **Note:** On Render's free tier, the backend spins down after 15 minutes of inactivity. Initial "cold-start" requests may take 30–60 seconds.

---

## 📜 License & Contribution

- See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on code style (Ruff) and the CI/CD pipeline.
- See [CHANGELOG.md](CHANGELOG.md) for a history of features built in each task.
- Licensed under the terms specified in [LICENSE](LICENSE).
