import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitWords from './SplitWords.jsx';

gsap.registerPlugin(ScrollTrigger);

const NODES = [
  { step: 'Step 01', title: 'Upload', body: 'Drop the resume and a job description. Nothing leaves your machine until it has been scrubbed.' },
  { step: 'Step 02', title: 'Scrub PII', body: 'Names, emails, phones, URLs, gender and location are stripped before any AI call is made.' },
  { step: 'Step 03', title: 'LLM parse', body: 'Evidence-grounded extraction. Every skill, role and degree ships with verbatim proof.' },
  { step: 'Step 04', title: 'Embed & match', body: 'Skills are embedded and matched against the job description with FAISS semantic search.' },
  { step: 'Step 05', title: 'Verdict', body: 'A weighted, explainable 0–100 score with risk signals and a full audit trail.' },
];

export default function ChapterPipeline() {
  const ref = useRef(null);
  const trackRef = useRef(null);
  const counterRef = useRef(null);
  const barRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const track = trackRef.current;
      const getDist = () => track.scrollWidth - window.innerWidth;

      gsap.to(track, {
        x: () => -getDist(),
        ease: 'none',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top top',
          end: () => '+=' + (getDist() + window.innerHeight),
          pin: true,
          scrub: 0.6,
          invalidateOnRefresh: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            const nodes = track.querySelectorAll('.pnode');
            nodes.forEach((n, i) => {
              const threshold = (i + 0.4) / nodes.length;
              n.classList.toggle('active', self.progress > threshold);
            });
            // connectors draw in just before the following node activates
            const arrows = track.querySelectorAll('.pipeline-arrow');
            arrows.forEach((a, i) => {
              a.classList.toggle('on', self.progress > (i + 0.9) / nodes.length);
            });
            if (counterRef.current) counterRef.current.textContent = `${String(Math.round(self.progress * 100)).padStart(3, '0')}%`;
            if (barRef.current) barRef.current.style.width = `${self.progress * 100}%`;
          },
        },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section className="pipeline-scene" id="how" ref={ref}>
      <div className="pipeline-head">
        <span className="chapter-tag" data-rv>03 · How it works</span>
        <h2 className="chapter-title">
          <SplitWords text="From file to" /> <SplitWords text="verdict." em />
        </h2>
        <p className="chapter-lead" data-rv>Keep scrolling. The pipeline moves with you.</p>
      </div>
      <div className="pipeline-track" ref={trackRef}>
        {NODES.map((n, i) => (
          <div style={{ display: 'flex', alignItems: 'center' }} key={n.step}>
            <div className="pnode">
              <div className="pstep">{n.step}</div>
              <h3>{n.title}</h3>
              <p>{n.body}</p>
            </div>
            {i < NODES.length - 1 && <div className="pipeline-arrow">→</div>}
          </div>
        ))}
      </div>
      <div className="pipeline-foot">
        <div className="pipeline-bar"><span ref={barRef} /></div>
        <div className="pipeline-progress" ref={counterRef}>000%</div>
      </div>
    </section>
  );
}
