import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

import { analyzeResume } from './api/client.js';
import Nav from './components/Nav.jsx';
import Preloader from './components/Preloader.jsx';
import Hero from './components/Hero.jsx';
import Ticker from './components/Ticker.jsx';
import ChapterProblem from './components/ChapterProblem.jsx';
import ChapterSolution from './components/ChapterSolution.jsx';
import ChapterPipeline from './components/ChapterPipeline.jsx';
import Analyzer from './components/Analyzer.jsx';
import AnalysisSequence from './components/AnalysisSequence.jsx';
import Results from './components/Results.jsx';
import Footer from './components/Footer.jsx';

import './index.css';
import './ui/nav.css';
import './ui/bits.css';
import './ui/preloader.css';
import './ui/hero.css';
import './ui/marquee.css';
import './ui/chapters.css';
import './ui/pipeline.css';
import './ui/analyzer.css';
import './ui/results.css';

gsap.registerPlugin(ScrollTrigger);

const INIT_STAGES = [
  { label: 'Scrubbing PII', pct: 12 },
  { label: 'Parsing resume with LLM', pct: 40 },
  { label: 'Parsing job description', pct: 62 },
  { label: 'Embedding + FAISS matching', pct: 85 },
  { label: 'Compiling verdict', pct: 100 },
];

export default function App() {
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState('site'); // 'site' | 'analyzing' | 'results'
  const [result, setResult] = useState(null);
  const [stages, setStages] = useState(INIT_STAGES);
  const [pct, setPct] = useState(0);
  const [error, setError] = useState('');
  const [resetKey, setResetKey] = useState(0);
  const lenisRef = useRef(null);
  const resultsRef = useRef(null);

  // Lenis + ScrollTrigger
  useEffect(() => {
    const lenis = new Lenis({ smoothWheel: true, lerp: 0.09 });
    lenisRef.current = lenis;
    window.__lenis = lenis;
    lenis.on('scroll', () => ScrollTrigger.update());
    const raf = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      delete window.__lenis;
    };
  }, []);

  // stop scrolling while preloader is visible
  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;
    if (loading) lenis.stop(); else lenis.start();
  }, [loading]);

  // safety-net scroll reveal for [data-rv]
  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('rv-in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.15 });
    const els = document.querySelectorAll('[data-rv]');
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [phase]);

  const handleAnalyze = async ({ resume, jobDesc, githubUrl, linkedinUrl }) => {
    setPhase('analyzing'); setError(''); setPct(0);
    try {
      const res = await analyzeResume({ resume, jobDesc, githubUrl, linkedinUrl, onStage: (s, p) => { setStages(s); setPct(p); } });
      setResult(res);
      setPhase('results');
      requestAnimationFrame(() => {
        if (resultsRef.current) resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    } catch (err) {
      setError(err.message || 'Analysis failed.');
      setPhase('site');
      throw err;
    }
  };

  const reset = () => {
    setPhase('site'); setResult(null); setPct(0); setResetKey((k) => k + 1);
    if (window.__lenis) window.__lenis.scrollTo(0);
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {loading && <Preloader onDone={() => setLoading(false)} />}

      <Nav />

      <div id="app">
        <Hero active={!loading} />
        <Ticker />
        <ChapterProblem />
        <ChapterSolution />
        <ChapterPipeline />
        <Analyzer key={resetKey} onAnalyze={handleAnalyze} />

        <div ref={resultsRef} style={{ scrollMarginTop: '4vh' }}>
          {phase === 'results' && result && <Results data={result} onReset={reset} />}
        </div>

        <Footer />
      </div>

      {phase === 'analyzing' && <AnalysisSequence stages={stages} pct={pct} error={error} />}
    </>
  );
}
