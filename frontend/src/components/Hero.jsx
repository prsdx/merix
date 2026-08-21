import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { scrollToId } from './Nav.jsx';
import SplitWords from './SplitWords.jsx';

gsap.registerPlugin(ScrollTrigger);

const STATS = [
  { n: 0, l: 'PII fields reach the model' },
  { n: 5, l: 'Auditable pipeline stages' },
  { n: 100, l: 'Point explainable score' },
];

export default function Hero({ active = true }) {
  const rootRef = useRef(null);

  useEffect(() => {
    if (!active) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set('[data-hero]', { opacity: 1, y: 0 });
        gsap.set('.hero-title .sw-w', { y: 0 });
        rootRef.current.querySelectorAll('.hero-stat .n').forEach((el) => {
          el.textContent = el.dataset.count;
        });
        return;
      }

      // masked word reveal for the headline
      gsap.to('.hero-title .sw-w', {
        y: 0, duration: 1.05, ease: 'power4.out', stagger: 0.055, delay: 0.2,
      });

      // supporting elements fade up
      gsap.fromTo('[data-hero]',
        { opacity: 0, y: 22 },
        { opacity: 1, y: 0, duration: 0.85, ease: 'power3.out', stagger: 0.1, delay: 0.6 });

      // count-up stats
      rootRef.current.querySelectorAll('.hero-stat .n').forEach((el) => {
        const target = Number(el.dataset.count || 0);
        const obj = { v: 0 };
        gsap.to(obj, {
          v: target, duration: 1.4, delay: 1.05, ease: 'power3.out',
          onUpdate: () => { el.textContent = Math.round(obj.v); },
        });
      });

      // gentle scroll-out: content lifts and fades, mint wash drifts
      gsap.to('.hero-inner', {
        y: -70, opacity: 0.25, ease: 'none',
        scrollTrigger: { trigger: rootRef.current, start: 'top top', end: 'bottom 35%', scrub: true },
      });
      gsap.to('.hero-glow', {
        yPercent: 32, ease: 'none',
        scrollTrigger: { trigger: rootRef.current, start: 'top top', end: 'bottom top', scrub: true },
      });
    }, rootRef);

    // soft cursor-follow glow (fine pointers only)
    let cleanupGlow = null;
    if (!reduced && !window.matchMedia('(hover: none)').matches) {
      const glow = rootRef.current.querySelector('.hero-mouse');
      gsap.set(glow, { xPercent: -50, yPercent: -50 });
      const xTo = gsap.quickTo(glow, 'x', { duration: 0.7, ease: 'power3' });
      const yTo = gsap.quickTo(glow, 'y', { duration: 0.7, ease: 'power3' });
      const section = rootRef.current;
      const onMove = (e) => {
        const r = section.getBoundingClientRect();
        xTo(e.clientX - r.left);
        yTo(e.clientY - r.top);
      };
      section.addEventListener('pointermove', onMove);
      gsap.to(glow, { opacity: 1, duration: 1.2, delay: 0.9 });
      cleanupGlow = () => section.removeEventListener('pointermove', onMove);
    }

    return () => { ctx.revert(); if (cleanupGlow) cleanupGlow(); };
  }, [active]);

  return (
    <section className="hero" ref={rootRef}>
      <div className="hero-glow" aria-hidden="true" />
      <div className="hero-mouse" aria-hidden="true" />
      <div className="hero-inner">
        <h1 className="hero-title">
          <SplitWords text="Every hiring verdict," manual /><br />
          <SplitWords text="backed by evidence." em manual />
        </h1>
        <p className="hero-sub" data-hero>
          PRISM reads a resume the way a careful recruiter would, then shows its work.
          Every point of the score maps to a quoted line, personal data is scrubbed before
          the AI ever runs, and nothing is guessed.
        </p>
        <div className="hero-ctas" data-hero>
          <button className="btn btn-primary" onClick={() => scrollToId('#analyzer')}>
            Analyze a resume <span className="b-arrow">→</span>
          </button>
          <button className="btn btn-ghost" onClick={() => scrollToId('#how')}>
            See how it works
          </button>
        </div>
        <div className="hero-stats" data-hero>
          {STATS.map((s) => (
            <div className="hero-stat" key={s.l}>
              <span className="n" data-count={s.n}>0</span>
              <span className="l">{s.l}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
