# Merix - Product Requirements Document

**Version**: 0.1 (Draft)
**Status**: Task 0 complete, Task 1 not started
**Last updated**: 2025-08-21

---

## 1. Problem Statement

Indian campus placement cells and staffing agencies process hundreds of resumes per job opening. Current tools are inadequate:

- **Black-box ATS systems** reject resumes with no explanation, making it impossible to defend decisions or help candidates improve
- **Keyword-based matching** rewards keyword-stuffing and punishes strong candidates who use different terminology
- **No explainability**: recruiters can't see *why* a candidate scored high or low
- **DPDP compliance risk**: most tools don't handle Indian data protection requirements (consent, retention, erasure)

Merix solves this by providing **explainable, evidence-grounded batch resume matching** with DPDP-compliant data handling.

---

## 2. Target Users

### Primary
- **Campus placement cells** at Indian engineering/management colleges (process 500-2000 resumes per company visit)
- **Staffing agencies** in India (process 100-500 resumes per client requirement)

### Secondary
- **In-house recruiters** at Indian startups and mid-size companies hiring for technical roles

---

## 3. Core v1 Feature Scope

### 3.1 Batch Resume-to-JD Matching
- Recruiter uploads a job description (JD) and up to 100 resumes (PDF/DOCX)
- System extracts structured data from each resume and the JD
- System computes a match score (0-100) for each resume against the JD
- System returns a ranked shortlist

### 3.2 Explainability of Match Scores
- Every match score includes:
  - Which skills matched (required vs preferred)
  - Strength of each match (advanced/medium/low)
  - Verbatim evidence from the resume for each matched skill
  - What skills are missing
  - Risk signals (e.g., "experience doesn't match JD requirement")
- Scores are auditable: recruiters can see exactly why a candidate scored as they did

### 3.3 Ranked Shortlist
- Display candidates ranked by match score
- Filter by score threshold (e.g., "show only 70+")
- Export shortlist as CSV

### 3.4 DPDP-Aware Data Handling
- **Consent**: Record recruiter confirmation that they have candidate consent before processing
- **Retention**: Auto-delete or anonymise resume data after 90 days (configurable)
- **Erasure**: Allow deletion of candidate data on request
- **PII scrubbing**: Remove names, emails, phone numbers before sending to LLM providers
- **Audit log**: Track who processed what resume, when

---

## 4. Explicitly Out of Scope for v1

- **Multi-tenant billing/subscriptions** (v2)
- **Candidate self-service portal** (v2)
- **Interview scheduling** (v2+)
- **Video interviews** (not planned)
- **Background verification** (v2+)
- **Integration with external ATS** (v2+)
- **Mobile app** (web-only for v1)
- **Multi-language resume parsing** (English only for v1)
- **Bulk email outreach** (v2+)

---

## 5. Success Metrics

### Product Metrics
- **Time to shortlist**: Reduce from ~4 hours (manual) to <10 minutes for 100 resumes
- **Recruiter override rate**: <20% (recruiters should trust the score most of the time)
- **Adoption**: 5 placement cells using Merix weekly by end of v1

### Technical Metrics
- **API latency**: p95 < 30s for batch of 100 resumes
- **Parse success rate**: >95% of resumes parse successfully
- **Uptime**: >99% (Supabase + deployment platform)

### Quality Metrics
- **Match accuracy**: TBD — requires labelled evaluation set (not yet built)
- **Explainability coverage**: 100% of match scores include evidence

---

## 6. Historical Context (Reference Only)

The following metrics come from prior RAG work on a different project (PlateWise) and are **not** Merix benchmarks:

- 94.2% hybrid retrieval hit-rate vs 78.5% dense-only
- 93.5% semantic cache latency reduction
- 98% structured constraint precision

**These numbers are historical reference only. Do not use them for Merix claims.** Merix has no benchmarks yet; we will build an evaluation set in a later task.

---

## 7. Non-Functional Requirements

### Security
- All API endpoints require authentication (JWT)
- All PII encrypted at rest (Supabase default) and in transit (TLS)
- File uploads validated (type, size, content)
- No PII sent to LLM providers without scrubbing

### Compliance
- DPDP Act (India): consent, retention, erasure, audit trail

### Performance
- Batch of 100 resumes processed in <30s (p95)
- API supports 10 concurrent recruiters (v1)

### Reliability
- Graceful degradation if LLM provider is down (queue + retry)
- Idempotent batch processing (safe to retry)

---

## 8. Open Questions

- **Pricing model**: TBD (not in v1 scope)
- **Resume storage**: Store raw PDFs in Supabase Storage, or delete after extraction? (Leaning toward store-with-retention)
- **Match score calibration**: How do we validate that a score of 80 actually means "strong fit"? (Requires evaluation set, Task 3+)
