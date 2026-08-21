import { useRef, useState, useEffect } from 'react';
import Magnetic from './Magnetic.jsx';
import SplitWords from './SplitWords.jsx';

export default function Analyzer({ onAnalyze }) {
  const [file, setFile] = useState(null);
  const [jobDesc, setJobDesc] = useState('');
  const [github, setGithub] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [drag, setDrag] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  // Prefill the built-in demo JD (dev convenience) so an analysis can run immediately.
  useEffect(() => {
    let cancelled = false;
    const API_BASE = import.meta.env.VITE_API_BASE || '';
    fetch(`${API_BASE}/api/demo`)
      .then(r => (r.ok ? r.json() : null))
      .then(d => { if (d && d.ok && !cancelled && !jobDesc) setJobDesc(d.jd); })
      .catch(() => { /* offline — leave blank */ });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (error) { const t = setTimeout(() => setError(''), 6000); return () => clearTimeout(t); }
  }, [error]);

  const readFile = (f) => { if (f && f.type === 'application/pdf') { setFile(f); setError(''); } else if (f) setError('Please drop a PDF file.'); };
  const onDrop = (e) => { e.preventDefault(); setDrag(false); readFile(e.dataTransfer.files?.[0]); };

  const ready = !!file && jobDesc.trim().length > 0 && !busy;

  const submit = async () => {
    if (!ready) return;
    setBusy(true); setError('');
    try {
      await onAnalyze({ resume: file, jobDesc: jobDesc.trim(), githubUrl: github.trim(), linkedinUrl: linkedin.trim() });
    } catch (err) {
      setError(err.message || 'Analysis failed. Check the server is running and try again.');
      setBusy(false);
    }
  };

  return (
    <section className="analyzer-section" id="analyzer">
      <div className="wrap analyzer-panel">
        <span className="chapter-tag" data-rv>04 · The analyzer</span>
        <h2 className="chapter-title"><SplitWords text="Reveal the" /> <SplitWords text="truth." em /></h2>
        <p className="analyzer-sub" data-rv>
          Upload a resume and paste a job description. PRISM returns a 0–100 fit score with
          the exact lines it used as evidence.
        </p>

        <div className="analyzer-card" data-rv>
          <div className={`dropzone ${drag ? 'drag' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
          >
            <input ref={inputRef} type="file" accept="application/pdf" hidden
              onChange={(e) => readFile(e.target.files?.[0])} />
            <div className="dz-icon">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 16V4" /><path d="M6 10l6-6 6 6" /><path d="M4 20h16" />
              </svg>
            </div>
            {file
              ? <div className="file-ok">✓ {file.name}</div>
              : <>
                  <div className="dz-label">Drag &amp; drop your resume (PDF)</div>
                  <div className="dz-hint">or click to browse · Max 200 MB</div>
                </>}
          </div>

          <div className="field-grid">
            <div className="field">
              <label>GitHub <span className="hint">optional</span></label>
              <input className="input" placeholder="https://github.com/username" value={github}
                onChange={(e) => setGithub(e.target.value)} />
            </div>
            <div className="field">
              <label>LinkedIn <span className="hint">optional</span></label>
              <input className="input" placeholder="https://linkedin.com/in/username" value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)} />
            </div>
          </div>

          <div className="field">
            <label>Job description</label>
            <textarea className="textarea" placeholder="Paste the job description here… Include required skills, responsibilities and specific requirements for an accurate evaluation." value={jobDesc}
              onChange={(e) => setJobDesc(e.target.value)} />
          </div>

          <div className="analyzer-cta-wrap">
            <Magnetic>
              <button className="btn btn-primary" disabled={!ready} onClick={submit}>
                Analyze resume <span className="b-arrow">→</span>
              </button>
            </Magnetic>
          </div>
          {!file && <div className="analyzer-hint">Upload a resume and paste a job description to begin.</div>}
          {error && <div className="analyzer-hint err">{error}</div>}
        </div>
      </div>
    </section>
  );
}
