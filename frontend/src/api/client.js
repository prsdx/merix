// Thin client for the Flask API.

const API_BASE = import.meta.env.VITE_API_BASE || '';

export async function healthCheck() {
  const res = await fetch(`${API_BASE}/api/health`);
  if (!res.ok) throw new Error('Health check failed');
  return res.json();
}

export async function analyzeResume({ resume, jobDesc, githubUrl, linkedinUrl, onStage, speed }) {
  const fd = new FormData();
  fd.append('resume', resume);
  fd.append('job_desc', jobDesc);
  if (githubUrl) fd.append('github_url', githubUrl);
  if (linkedinUrl) fd.append('linkedin_url', linkedinUrl);

  const stages = [
    { label: 'Scrubbing PII', pct: 12 },
    { label: 'Parsing resume with LLM', pct: 40 },
    { label: 'Parsing job description', pct: 62 },
    { label: 'Embedding + FAISS matching', pct: 85 },
    { label: 'Compiling verdict', pct: 100 },
  ];

  const started = performance.now();
  const timer = setInterval(() => {
    const el = performance.now() - started;
    const target = Math.min(95, stages[Math.min(stages.length - 1, Math.floor(el / 1500))].pct);
    if (onStage) onStage(stages, target);
  }, 220);

  try {
    const res = await fetch(`${API_BASE}/api/analyze`, { method: 'POST', body: fd });
    let body = null;
    try { body = await res.json(); } catch { /* malformed */ }
    if (!res.ok || !body?.ok) {
      const msg = body?.error || `Server responded ${res.status}`;
      throw new Error(msg);
    }
    return body.result;
  } finally {
    clearInterval(timer);
    if (onStage) onStage(stages, 100);
  }
}