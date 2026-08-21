# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
