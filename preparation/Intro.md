# Three-Minute Project Introduction

> Spoken script — natural, first-person, ~350–500 words. Aim for about three minutes.

## Why

Traditional hiring is a black box. An applicant-tracking system rejects a resume and nobody — not the recruiter, not the candidate — can explain why. That opacity rewards keyword-stuffing, punishes genuinely strong candidates who phrase things differently, and, when AI gets involved, usually makes the problem worse by adding confident, unverifiable scores. I built Glass-Box Recruiter around the opposite idea: a hiring signal is only useful if it is *explainable*.

## What

It is a resume-versus-job-description matching tool. A recruiter uploads a resume PDF, pastes a job description, and the system returns a fit score out of a hundred — but the score is never just a number. Next to it, the interface shows exactly *which skill matched, how strongly, what is missing, and the verbatim line from the resume that supports each claim*. Anything the system cannot evidence actively lowers the score. That is the product: not “this candidate is a 78,” but “this candidate is a 78, and here is the proof, and here is what is uncertain.”

## How

Under the hood it is a four-stage, stateless pipeline, all Python, wired into a thin Flask API with a React frontend. First, `extract_text.py` pulls text out of the PDF with PyMuPDF and scrubs personal data — names, emails, phone numbers — before anything leaves the machine. Second, two LLM calls — one for the resume, one for the job description — convert that raw text into structured JSON, running through Groq with temperature zero. The resume prompt is the heart of the design: it forbids the model from inferring or hallucinating, and requires a verbatim evidence snippet for every extracted skill, role, and degree. Third, `embed_out.py` embeds everything with a small SentenceTransformer model and matches JD requirements against resume skills using FAISS cosine search, so “Kubernetes” matches “K8s” without fragile keyword rules. Finally, a weighted formula — skills fifty percent, experience thirty, education twenty, minus a transparency penalty for anything unevidenced — produces the score.

The decision I am most proud of is the grounding constraint. It was deliberately harder to build than a trust-me LLM call, because it forced me to structure extraction around evidence rather than convenience, and it is what makes the output defensible in a hiring context. The trade-off I am most aware of is that the whole thing runs synchronously on a single worker — fine for a demo, and intentional because the embedding model is memory-heavy, but it means one slow request blocks everyone else.

## What Now

Right now it is a polished prototype, not a production system: there is no authentication, no rate limiting, no persistence, no test suite, and no CI. The single most valuable next step is to secure the API and offload the heavy processing, because those two are what currently prevent it from being safe and fast with more than one user. From there it can grow into a real screening tool with a recruiter dashboard, a labelled evaluation set to tune the matching thresholds, and a proper fairness review. That is where I would take it next — happy to go deeper on any part.

---

## Thirty-Second Version

> “Tell me briefly about your project.” (75–120 words)

I built Glass-Box Recruiter, an evidence-grounded resume screening tool. You upload a resume and a job description, and instead of a black-box score, it returns a zero-to-a-hundred fit plus the exact resume lines that justify every point. It is a four-stage pipeline: scrubbing PII from the PDF, extracting structured data with a temperature-zero LLM that is forbidden from hallucinating, matching skills semantically with FAISS embeddings, and scoring with a weighted formula that penalises unevidenced claims. It is currently a well-polished prototype with a Flask API and React frontend — the obvious next step is hardening it for production.

---

## Key Points to Remember

- The product is **explainability**, not scoring: verbatim evidence for every point.
- Pipeline: **scrub PII → LLM-parse (temp 0, grounded) → FAISS semantic match → weighted 0–100**.
- Weighting: **Skills 50 / Experience 30 / Education 20**, minus a penalty for unevidenced items.
- Model: **Groq `openai/gpt-oss-120b`**, embeddings **`all-MiniLM-L6-v2`**.
- Stack: **Python + Flask API + React/Vite frontend** (Streamlit legacy fallback).
- Honest limits: **no auth, no rate limiting, no DB, no tests, single sync worker.**
- README vs code drift (thresholds, model name, GitHub/LinkedIn stub) — be ready to address.
- One strong decision to lead with: the **evidence-grounding constraint** in the resume prompt.
