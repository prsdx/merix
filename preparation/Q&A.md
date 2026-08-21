# Senior-Engineer Interview Q&A

> Model answers in first person, grounded in the repository. 20 questions.

## 1. Question
What is the core product problem, and how does evidence-grounded scoring actually change a recruiter's workflow versus a plain keyword ATS or a raw LLM call?

### What the Interviewer Is Testing
Whether you understand your user and can articulate value, not just describe features.

### Strong Answer
The problem is that hiring decisions are opaque. A keyword ATS silently rejects a resume with no explanation, and a raw LLM call gives a confident score with no way to verify it. Our differentiator is that every point of the score in `embed_out.py` ships with a verbatim `evidence` string pulled from the resume by `resume_function.py` — the prompt literally forbids the model from inferring or adding anything. So the recruiter workflow changes from “trust this number” to “verify this number”: they can open any matched skill and see the exact resume line that justified it, and anything we couldn't evidence actively lowers the score through the transparency penalty. That turns screening into a triage conversation rather than a black box. I'd be honest that we haven't validated this value with users yet — it's the hypothesis, and measuring recruiter trust and time-to-decision is the next step.

### Likely Follow-Up
“How would you measure that the evidence actually reduces recruiter error, rather than just feeling more transparent?”

### Strong Follow-Up Direction
Propose a side-by-side evaluation: recruiters review the same candidates with and without evidence, and you compare decision accuracy, time, and overrides of the score. A labelled dataset of resumes with known-fit outcomes would let us measure false positives/negatives, which none of the current code does.

### Red Flags to Avoid
Claiming “transparency = accuracy.” Treating the README claim as implemented without noting it lacks validation. Inventing adoption numbers.

## 2. Question
Walk me through the end-to-end architecture and where the big performance and extensibility seams are.

### What the Interviewer Is Testing
System comprehension and the ability to reason about a real data-flow, not a diagram.

### Strong Answer
It's a modular monolith: `extract_text.py` scrubs the PDF, `resume_function.py` and `jd_function.py` parse via Groq, `embed_out.py` embeds and matches, and `server.py` exposes it as a Flask API consumed by a React frontend. The important seams are: first, the four modules are cleanly separated and the matcher is a pure `run_matching_pipeline(jd_json, resume_json)` reused by the CLI, the Streamlit app, and the API; second, `server.py` deliberately does not import `app.py` and re-implements a small `transform_result`, so the JSON contract between backend and frontend is the real interface. The biggest performance seam is that all four stages run synchronously in a single request with one gunicorn worker, and the embedding model is loaded once at import. The biggest extensibility seam is the hardcoded weighting in `compute_final_score` — currently skills 50, experience 30, education 20 with a 1.5-point miss penalty — which would need to become configuration with an eval set before we tune it.

### Likely Follow-Up
“Why not make each stage its own service?”

### Strong Follow-Up Direction
Explain that at this scale a separate service per stage would cost operational complexity with no throughput benefit, and that the first split should be along the expensive slow path (LLM + embedding) behind a queue — not a microservice-per-module.

### Red Flags to Avoid
Calling it “microservices-ready” or drawing vanity architecture. Saying each module is “scalable” without naming concurrency limits.

## 3. Question
Why semantic embedding matching over keyword matching, and what specifically can still break with a k=1 FAISS nearest-neighbour lookup?

### What the Interviewer Is Testing
Depth on a core technology choice, including its failure modes.

### Strong Answer
Keyword matching fails on synonyms — “K8s” versus “Kubernetes” — which is exactly the brittleness the project pushes back on. So `embed_out.py` embeds JD requirements and resume skills with `all-MiniLM-L6-v2`, L2-normalises them, and does cosine similarity via a FAISS `IndexFlatIP`, then bucketises into advanced/medium/low at 0.75 and 0.5 thresholds. The real weakness is that we take only the single nearest neighbour per requirement: with small 384-dim vectors and no threshold on an absolute minimum, a resume with no relevant skills still returns its *closest* match as a “medium” or “low” — it never says “no match,” it says “weak.” Combined with hand-tuned thresholds that were never calibrated against labelled data, that means false matches are possible and we have no measured precision/recall. The fix is a calibration eval set and a minimum-similarity cutoff, and possibly k>1 or a hybrid exact-keyword tiebreak for acronyms.

### Likely Follow-Up
“How would you build that eval set when you have no labelled data today?”

### Strong Follow-Up Direction
Describe a bootstrap loop: have a human label a few hundred resume–JD pairs, then use agreement with human labels to tune thresholds; optionally detect acronym expansions with a curated alias list while keeping the semantic path as the general case.

### Red Flags to Avoid
Using terms like “AI-powered semantic intelligence” without specifics. Claiming the thresholds are “optimised.”

## 4. Question
There's no database. Is that a legitimate choice for this product, and when would you introduce persistence?

### What the Interviewer Is Testing
Data-modelling judgment and the discipline to avoid unnecessary state.

### Strong Answer
The “data model” today is really the JSON contract between the LLM extractors and the matcher: resume `skills/experience/education/certifications` with `evidence` strings, JD `required/preferred skills`, and the match result plus `final_score`. Statelessness is a strength here: less attack surface, no retention of candidate PII, trivial deployment, and the unit of value is a one-shot score. But it also means no history, no recruiter can compare candidates over time, and identical resumes get re-LLM'd at cost. I would introduce persistence when recruiters ask for a candidate dashboard or when repeated scans become a measurable cost — then store the *scrubbed, structured* JSON with explicit candidate consent and a retention policy, not the raw PDFs, and add a content-hash cache so re-processing is avoided. In other words: persistence should be product-driven, and we should stay stateless until a concrete feature forces the change.

### Likely Follow-Up
“How would you store the evidence strings for later audit without reintroducing PII risk?”

### Strong Follow-Up Direction
Note that the verifiable claim is the *structured match*; the `evidence` snippets are already taken from PII-scrubbed text, but you would re-run the scrubber or store only redacted spans and document an audit/retention policy before storing anything.

### Red Flags to Avoid
Inventing a database that doesn't exist. Dismissing persistence as “bad” rather than deferring it for a reason.

## 5. Question
`POST /api/analyze` accepts a resume and a job description with no authentication. Walk me through how you'd design the API boundary for a public launch.

### What the Interviewer Is Testing
API design and pragmatic security thinking under real constraints.

### Strong Answer
Today the API is an internal-ish boundary: the only “identity” is the `GROQ_API_KEY` loaded server-side, and `add_cors_headers` is effectively open, and there is no rate limit, so a public endpoint is an open invitation to burn Groq credits. For a public launch I'd add, in order: an API key or short-lived token per caller, a per-key rate limit and monthly quota, server-side file-size and content-type validation (currently only the filename suffix is checked), and a versioned route so the response contract can evolve. I'd also make the errors more contract-like — right now it's a mix of 400/422/500 with free-text messages, and I'd return a stable error code enum the frontend can act on. Idempotency is mostly irrelevant for a pure read operation, but a lightweight request hash could let us cache repeats. None of this changes the pipeline; it's a boundary we simply haven't built yet.

### Likely Follow-Up
“Why rate limiting before auth, or vice versa — what ordering do you defend?”

### Strong Follow-Up Direction
Argue that they're complementary but auth has to come first because rate limiting is meaningless without a key to bucket on; an anonymous global limiter would either be trivially bypassable or would block legitimate bursts.

### Red Flags to Avoid
Saying the endpoint is secure because PII is scrubbed. Proposing OAuth scopes for a demo. Ignoring the CORS reflection issue.

## 6. Question
This tool classifies people in the hiring domain. Beyond “there's no login,” what authentication, authorization, and governance gaps do you see, and which would you fix first?

### What the Interviewer Is Testing
Whether you think about people-grade systems and responsible AI, not just API keys.

### Strong Answer
There is no concept of identity — no accounts, roles, sessions, or per-resource permissions anywhere. For a hiring product that's two gaps: a technical one (unauthenticated `POST /api/analyze` lets anyone spend Groq quota) and a governance one (there's no audit trail linking a score to who produced it and from what input, and no bias/fairness review of the scoring outcome itself). My order would be: first, per-tenant API keys with quotas to stop abuse; second, audit logging of every analysis — input hash, structured result, and caller — without storing raw PII; third, a documented fairness evaluation, because the scoring weights in `compute_final_score` are hand-tuned and currently unvalidated against any demographic data. I would also flag that our evidence grounding helps *explainability*, but explainability is not the same as *fairness* — a scoring rule can be perfectly explained and still be biased — so governance has to include measuring outcome distribution, not just producing receipts.

### Likely Follow-Up
“Explainability vs fairness — give me a concrete example where this system is explainable but still unfair.”

### Strong Follow-Up Direction
Example: the experience weighting favours the exact phrasing of role and `duration_years`, and the scrubber strips location/gender — but duration-based matching could systematically down-rank candidates with career gaps (e.g., caregivers), which is explainable line-by-line yet potentially discriminatory; would propose auditing outcome slices.

### Red Flags to Avoid
Conflating explainability with fairness, or claiming `extract_text.py` makes the system compliant/privacy-safe.

## 7. Question
A request fails at 2 AM with a 422 “Resume LLM response was not valid JSON.” What's your debugging and remediation path, and how would you harden it?

### What the Interviewer Is Testing
Operational debugging under a realistic failure, and how you turn an incident into a fix.

### Strong Answer
The 422 comes from `_parse_json` (via `_run_analysis`) when the Groq response isn't valid JSON even after stripping code fences — the server echoes the first 300 chars. So first I'd confirm which side failed (resume vs JD, both raise distinct messages) and look at the echoed snippet to see whether it's a fence variant we don't strip, a truncated response, or the model refusing/rambling. Then I'd check Groq-side: rate limits, model availability, or a prompt that suddenly produced prose. For remediation I'd add three things: schema validation *after* parse so a valid-but-wrong shape is caught, rather than assuming shape; a bounded retry with backoff for transient failures; and a structured error that doesn't leak raw LLM text to the client. Longer term, `temperature=0` helps determinism but doesn't guarantee JSON — switching to function-calling or JSON-mode would be the structural fix, and caching the (expensive) successful resume parse so a later JD failure doesn't discard it.

### Likely Follow-Up
“Would you retry an LLM call that returned invalid JSON? When is retrying unsafe?”

### Strong Follow-Up Direction
Retry only transient/timeout failures, and for invalid JSON retry a small fixed number of times with the same zero temperature, but never silently retry into eventual-wrong-answer territory; if it keeps failing, fail the request and tell the user, don't guess.

### Red Flags to Avoid
Saying “the model is hallucinating” without checking the actual response. Proposing infinite retries or silently returning a default score.

## 8. Question
The frontend shows a progress bar that isn't real. Is that acceptable, and what are the real performance costs hiding behind it?

### What the Interviewer Is Testing
Honesty about UX vs reality, and awareness of actual latency drivers.

### Strong Answer
It's a known cosmetic shortcut: `client.js` drives stage percentages off a 220ms timer capped at 95 until the fetch resolves, so the bar is decoupled from real work — it's a UX placeholder, not instrumentation. I think it's acceptable *early on* because a frozen UI during a 10–30s analysis is worse, but it's also hiding the real story: two synchronous LLM calls plus a per-request embedding pass, all on one worker. The real costs are Groq latency (dominant), the embedding encode, and full serialisation under concurrency. The honest move is to replace the fake timer with real stage events from the server — the backend already knows exactly which stage it's in since `_run_analysis` is sequential — and to measure p95 per stage. Faking progress is only a problem when the number diverges from reality in a way that misleads; today it can sit at 95% for most of the wait, which is fine for a demo but not for a production tool.

### Likely Follow-Up
“What's your estimate of where the time goes, and how would you confirm it?”

### Strong Follow-Up Direction
Say you'd instrument per-stage timing (extract / resume-parse / jd-parse / embed+match) before optimising; hypothesise the two LLM calls dominate, but confirm with data rather than assert.

### Red Flags to Avoid
Claiming the bar reflects real progress. Quoting latency numbers that aren't measured.

## 9. Question
What breaks at ten times the current scale, and what's the first bottleneck you'd hit?

### What the Interviewer Is Testing
Scalability reasoning that's specific, not textbook.

### Strong Answer
The first hard bottleneck is concurrency, not compute: gunicorn is pinned to `--workers 1 --threads 1`, so requests fully serialise. Ten times the traffic doesn't just slow things by 10x, it creates a queue behind a 300s timeout. The reason for one worker — the embedding model plus PyTorch being memory-heavy, stated in the Dockerfile comments — stops being a good trade the moment there are two requests in flight. After that, cost becomes the bottleneck: every request makes two LLM calls and rebuilds FAISS indexes from scratch, with no caching of parsed resumes. So the scaling order I'd defend is: (1) move the slow pipeline off the request thread into a queue/worker so the API returns quickly and workers scale independently; (2) share the embedding model across workers instead of one copy each; (3) content-hash caching so the same resume isn't re-LLM'd. Compute scale is the easy part; the current architecture's ceiling is its synchronous single-worker design.

### Likely Follow-Up
“Why not just bump `--workers` to 8 and be done?”

### Strong Follow-Up Direction
Because the embedding model is big enough that 8 workers = 8 copies in RAM, and threads don't help since the work is CPU/blocking-bound; the real fix is decoupling the model from the HTTP worker, not multiplying it.

### Red Flags to Avoid
Hand-waving “we'd autoscale.” Saying LLM is the bottleneck without mentioning the single-worker ceiling first.

## 10. Question
There's no database, so where do consistency and concurrency concerns actually live in this system, today and later?

### What the Interviewer Is Testing
Whether you can reason about state and race conditions even when persistent state is absent.

### Strong Answer
Today there's almost no shared mutable state: each request is independent, the only concurrency risk is the single-worker serialisation, and the temp PDF is written and deleted within a `try/finally` in `_run_analysis`. The `load_dotenv()` at import plus a module-level embedding model are process-global but immutable after boot, so no races there. The one place a real bug can appear is if we naively add per-request caching without a key: two different candidates with identical scrubbed text would collide. Later, once we add persistence, consistency becomes real — if we store matches, we need to handle concurrent re-scoring of the same resume, decide on idempotency (a content-hash upsert is a natural choice), and define what “the current score” means when the JD or the model prompt changes. I'd frame it as: today, consistency concerns are intentionally minimal because state is absent; the design debt is that we have no story for what happens when we add state, not a current correctness bug.

### Likely Follow-Up
“How would you key a cache without storing PII?”

### Strong Follow-Up Direction
Key on a cryptographic hash of the *scrubbed* text (or better, of the extracted structured JSON), store only the structured result plus hash, and never persist raw resume text.

### Red Flags to Avoid
Inventing transactions that don't exist. Ignoring the temp-file lifecycle as a real (if small) correctness detail.

## 11. Question
Give me your security review of the current code, and the single highest-risk item you'd fix before exposing it publicly.

### What the Interviewer Is Testing
Real security judgment and prioritisation, not a checklist recital.

### Strong Answer
The highest-risk item is that the API is unauthenticated and unthrottled, so any caller can hit `POST /api/analyze` and burn Groq credits — that's a direct cost and abuse vector, and it's what I'd fix first with an API key plus a per-key quota. After that, the open CORS policy (`add_cors_headers` reflects the request Origin and defaults to `*` with credentials enabled) is effectively no cross-origin control. Then: file uploads are checked only by filename suffix — a renamed file reaches PyMuPDF with no server-side size or page limit, which is a DoS vector on a single worker; dependencies are unpinned, so builds aren't reproducible and supply-chain risk is unmanaged; and there's a prompt-injection surface because the resume text and job description are both user-controlled inputs into the LLM, which matters because our fairness claims depend on the model obeying its prompt. On the positive side, the static-file route guards path traversal and the temp file is cleaned up properly. I'd rank credit-consumption first because it's immediate, easy to exploit, and cheap to fix.

### Likely Follow-Up
“How would you mitigate prompt injection in a resume without over-engineering?”

### Strong Follow-Up Direction
Treat the parsed output as untrusted and never as instructions; validate schema, ignore any fields outside the expected shape, and don't forward any “reasoning” from the model downstream. A resume is data to be extracted, not code to be executed.

### Red Flags to Avoid
Reciting OWASP without prioritisation. Claiming the PII scrub makes it secure. Providing exploit detail.

## 12. Question
There are no tests in this repo. Where would you start, and what's the first test you'd write?

### What the Interviewer Is Testing
Testing instincts and the ability to pick the highest-value target, not breadth.

### Strong Answer
There's no test directory or runner at all, so I'd start where correctness is cheap to assert and expensive to get wrong: the scoring core in `embed_out.py`. The first test I'd write is for `compute_final_score` with pure-JSON fixtures — empty categories should score 0, the miss penalty should cap at 15, and the 50/30/20 weighting should renormalise when a category is absent. Those functions are already pure and importable, so no mocking is needed. After that I'd add unit tests for the level thresholds at the 0.75/0.5 boundaries, the PII regexes in `extract_text.py` (including cases they should *not* strip), and `_parse_json` fence-stripping in `server.py`. For the LLM-dependent path I'd test the Flask endpoint with the two extract functions monkeypatched, so I can exercise validation and error codes without hitting Groq. The React UI I'd leave until later — it's lower risk and much more expensive to test than the scoring math.

### Likely Follow-Up
“How would you make the LLM parse testable given you can't mock the whole pipeline easily?”

### Strong Follow-Up Direction
Point out the matcher only needs JSON, so you inject fixed JSON fixtures into `run_matching_pipeline`; for the extraction prompt itself, you'd test it as a contract test against recorded responses rather than live calls.

### Red Flags to Avoid
Claiming tests exist or pass. Proposing a full E2E suite before the cheap unit tests.

## 13. Question
Walk me through how this actually ships — build, deploy, run — and the operational gaps you'd close.

### What the Interviewer Is Testing
Whether you understand your own deployment surface and its gaps.

### Strong Answer
It ships as a Docker image: `Dockerfile` installs only `requirements-server.txt` (Streamlit is excluded to keep the image small), pre-downloads the `all-MiniLM-L6-v2` model at build time so first request and `/api/health` don't stall, and runs gunicorn with `--timeout 300 --workers 1 --threads 1`. There are three deployment targets — a Render Blueprint (`render.yaml`, health check on `/api/health`, `GROQ_API_KEY` injected as a secret), a Hugging Face Spaces variant (`hf-space/`, port 7860), and an Oracle VM provisioning script (`deploy/oracle/setup.sh`, systemd + ufw). The React frontend is built separately and served from `frontend/dist` by Flask, or deployed to Vercel. The gaps: there's no CI/CD at all (no workflow, no lint, no build verification), no structured logging or metrics beyond `traceback.print_exc`, and the three deploy targets duplicate the pipeline — `hf-space/` carries copies of the backend modules that can drift. I'd first add a CI job that builds the image and runs the (new) unit tests, then consolidate the deployment definitions so there's one source of truth.

### Likely Follow-Up
“How do you know it's healthy in production?”

### Strong Follow-Up Direction
`/api/health` only reports dependency presence and whether the Groq key is set; I'd extend it (or add metrics) to expose error rate, latency, and Groq-availability so a degraded state is visible before users report it.

### Red Flags to Avoid
Claiming it's “deployed and running” without evidence. Presenting three deploy targets as a feature rather than drift risk.

## 14. Question
The only observability is a `print` and a `traceback.print_exc()`. What would you add, and what would the first alert be?

### What the Interviewer Is Testing
Whether you connect observability to the specific failure modes of this system.

### Strong Answer
Since the system is synchronous and cheap-to-fail in loud ways, I'd add: structured JSON logs with a request ID propagated through `_run_analysis`; per-stage timing (extract, resume-parse, jd-parse, embed+match); error counters by route and by failure class (422 JSON-parse vs 503 missing deps vs 500 unexpected); and a Groq-availability/latency gauge. The first alert I'd wire is on the LLM parse-failure and error rate, because a sudden jump there means either the model endpoint changed or the prompt broke, and that's the core value path. A close second is latency p95, since a single slow request blocks the one worker and stalls everyone. I'd avoid exporting any resume text to logs — only hashes and structured results — to keep logs PII-free. The key principle is that `/api/health` today tells you “deps are present,” which is liveness, not readiness or correctness; I'd make health reflect the actual pipeline's ability to process a request.

### Likely Follow-Up
“What does ‘readiness' mean for a stateless service like this?”

### Strong Follow-Up Direction
Readiness = can it actually serve a request end-to-end (deps, Groq key, model loaded), which is already partially surfaced via `deps` in `/api/health`; the pipeline report is good but needs a lightweight canary rather than a full analysis.

### Red Flags to Avoid
Suggesting a metrics/alerting stack without tying it to concrete failure modes. Saying the existing health endpoint is sufficient.

## 15. Question
You depend on Groq for inference and sentence-transformers for embeddings. How do you reason about that external dependency, and what's your failover story today?

### What the Interviewer Is Testing
Dependency-risk thinking and honest assessment of resilience.

### Strong Answer
The LLM is a hard external dependency: both extractors call `ChatGroq(model="openai/gpt-oss-120b")` with a single `GROQ_API_KEY`, so if Groq is down or rate-limited, the whole product is down — there's no fallback model, no retry, and no circuit breaker. The embedding dependency is softer at runtime because the model is downloaded and loaded locally, but it's still pinned to whatever `sentence-transformers` version installs, and swapping it would silently change every similarity score. My failover plan for the LLM would be to abstract behind a provider interface with a secondary endpoint (e.g., a second Groq key or an alternative compatible model) and add retries with backoff plus a circuit breaker so a Groq outage degrades gracefully instead of failing hard. For embeddings, version-lock the model artifact and treat embedding changes as a breaking change requiring re-evaluation of thresholds. The honest answer is we have no failover today — the single-provider dependency is acceptable for a prototype but is the clearest operational risk alongside single-worker concurrency.

### Likely Follow-Up
“If you swap embedding models, what actually breaks downstream?”

### Strong Follow-Up Direction
The 0.75/0.5 level thresholds in `get_level` are calibrated against `all-MiniLM-L6-v2`'s cosine distribution, and the final score flows entirely from those levels, so a new model's different similarity distribution would shift scores without changing any code — thresholds would need recalibration.

### Red Flags to Avoid
Pretending there's a failover that doesn't exist. Underestimating the embedding-swap coupling to scoring thresholds.

## 16. Question
What's the single most important trade-off you made in this project, and would you make it again?

### What the Interviewer Is Testing
Self-awareness about consequences, not just pride in decisions.

### Strong Answer
The evidence-grounding constraint. Requiring every extracted item to carry a verbatim snippet from the resume — enforced in the `resume_function.py` prompt, with “null if absent” rules and temperature zero — is what makes the output defensible, but it has real costs: it makes extraction more brittle (strict prompts sometimes under-extract or return unexpected shapes), it makes the system conservative by design (the miss penalty in `compute_final_score` actively punishes uncertainty), and it put the entire correctness of the product on prompt engineering rather than a deterministic parser. I'd make it again, because explainability isn't a nice-to-have here, it's the product; but I'd add what it's currently missing, which is schema validation and a labelled evaluation loop to measure how often the “grounded” output is actually correct versus just quoted. The honest framing is that grounding limits hallucination in what we *show*, but it does not by itself guarantee the extraction is *right* — it only guarantees we can audit it.

### Likely Follow-Up
“Where in the code would a grounding failure actually show up and escape notice?”

### Strong Follow-Up Direction
A model can quote a resume verbatim yet misclassify a skill's level, or match “Python” to “Python scripting” at a misleading similarity; the evidence string would look fine while the *match* is wrong — which is why a labelled eval set matters more than the prompt's confidence.

### Red Flags to Avoid
Overclaiming the grounding “eliminates hallucination.” Not acknowledging the prompt-dependence as structural risk.

## 17. Question
What's the technical debt you'd pay down first, and why that over everything else?

### What the Interviewer Is Testing
Prioritisation and ability to distinguish urgent debt from cosmetic debt.

### Strong Answer
The debt that's actively risky, not just ugly, is the missing schema validation and retry around the LLM JSON, plus the single-worker synchronous pipeline. A parsed-but-wrong JSON shape will silently produce a misleading score, and with no retry, a transient Groq failure becomes a user-facing error — these directly undermine the product's core promise of trustworthy output. The duplicated `transform_result` in `app.py` and `server.py` is the clearest *structural* debt (and it's already drifted: fit thresholds differ between the React UI and the README), but it doesn't cost real money or wrong scores the way validation does. So my order is: validate + constrain LLM output, add a bounded retry, then consolidate the duplicated glue, then retire the legacy Streamlit UI. I'd deprioritise the fake progress bar and the cosmetic stuff until the correctness and concurrency issues are addressed.

### Likely Follow-Up
“Why is duplicated glue worse than the missing tests?"

### Strong Follow-Up Direction
Acknowledge missing tests are also critical, but argue tests protect against regressions while the duplicated glue actively *produces* drift today (the threshold discrepancy is evidence of it), so consolidating it shrinks the surface tests must cover and removes a known bug source.

### Red Flags to Avoid
Listing debt without a priority order. Choosing the easy cosmetic fix over the correctness risk.

## 18. Question
If you were starting this from scratch today with the same goal, what would you redesign?

### What the Interviewer Is Testing
Whether you've internalised the lessons rather than just documented them.

### Strong Answer
Three things. First, I'd make the LLM boundary a proper schema-validated contract from day one — function-calling or JSON-mode instead of parsing free-form text with `_parse_json` — because doing it retroactively is exactly the debt we're carrying now. Second, I'd decouple the heavy pipeline from the HTTP request: a queue/worker boundary is easy to design in early and painful to bolt on after the single-worker assumption is baked into the Docker and deploy scripts. Third, I'd define the scoring weights and thresholds as versioned configuration from the start, sitting on top of a labelled evaluation set, so we can tune skills/experience/education weights and similarity cutoffs empirically instead of hand-picking 50/30/20 and 0.75/0.5. I would *keep* the modular four-stage pipeline and the evidence-grounding design — those are right — but I'd treat “the score is correct” as a measurable property, not a prompt-writing exercise. Fundamentally I'd optimise for testability and observability earlier, because that's what the current version is missing most.

### Likely Follow-Up
“What would you keep unchanged?"

### Strong Follow-Up Direction
Keep the pipeline module boundaries (`extract_text` / `resume_function` / `jd_function` / `embed_out`), the stateless no-DB posture, and the PII-scrub-before-LLM ordering — those are durable design choices.

### Red Flags to Avoid
Saying “I'd rebuild it in a different language/framework” without a concrete defect to justify it. Redesigning away the parts that already work.

## 19. Question
What does the next six months look like for this project, and how do you sequence product versus infrastructure work?

### What the Interviewer Is Testing
Roadmapping judgment and balancing product value with engineering foundations.

### Strong Answer
It's a prototype, so the next six months are about going from “convincing demo” to “safe, measurable tool.” In the first weeks I'd focus on foundations that unblock everything else: auth + rate limiting (protect cost), schema validation + a test suite (protect correctness), and CI (protect future change). Over one to two months I'd add the async pipeline so it can serve concurrent users, and a content-hash cache to cut redundant LLM spend. In parallel, product work: a recruiter dashboard and history — but only with persistence terms laid out (consent, retention, PII). In months three to six the centre of gravity shifts to quality and trust: build a labelled evaluation set, tune the scoring thresholds, and run a fairness review across demographic slices, because for a hiring product, “does the score behave fairly” is a launch blocker, not a nice-to-have. The sequencing principle is: fix cost and correctness risks before investing in scale, and treat fairness evaluation as a product requirement rather than a research side-quest.

### Likely Follow-Up
“What would make you *not* ship this to real recruiting in the next six months?"

### Strong Follow-Up Direction
Decide honestly: no unpinned dependencies, no unvalidated score, no fairness review, and no rate limiting are each independently a reason to hold — shipping a hiring tool that consumes funds unboundedly or scores people with unvalidated thresholds is irresponsible.

### Red Flags to Avoid
Feature-creep roadmap with no prioritisation. Promising dates. Ignoring the compliance/fairness dimension of a hiring product.

## 20. Question
How will you know this project is actually working well — for users and for the business — six months from now?

### What the Interviewer Is Testing
Whether you can define success concretely and measurably.

### Strong Answer
I'd separate “works well” into a few measurable things, none of which we currently track. For the product, does a recruiter make a defensible decision faster — measurable as time-to-decision and, more importantly, *override rate* (how often they change the score after reading evidence) and decision accuracy against a labelled outcome. For quality, the LLM parse-failure rate and schema-validity rate, and the score's stability across repeated runs. For trust, agreement with human reviewers on a labelled set — essentially precision/recall of our “strong fit” calls — and a fairness metric showing score distributions aren't systematically biased across protected groups. For operations and cost, end-to-end p95 latency and Groq cost per analysis with the cache hit rate. The unifying theme is that I'd measure outcomes on real data, not just “it runs,” because the current repo measures nothing — and a tool whose entire value is trust has to be able to *demonstrate* trust with numbers, not just quoted evidence.

### Likely Follow-Up
“Which of those would you instrument first, given limited effort?"

### Strong Follow-Up Direction
Start with accuracy against a small labelled set plus parse-failure rate, because those directly reflect the core risk (is the score actually right); operational metrics are cheap but less decision-relevant than correctness.

### Red Flags to Avoid
Defining success as “uptime” or “number of users.” Quoting metrics you haven't instrumented. Ignoring the fairness metric in a hiring product.
