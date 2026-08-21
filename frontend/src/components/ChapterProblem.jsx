import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitWords from './SplitWords.jsx';

gsap.registerPlugin(ScrollTrigger);

const PAINS = [
  {
    n: '01', title: 'Silent rejections',
    body: 'A resume goes in and a verdict comes out — but no one, including the recruiter, can explain the reasoning behind it.',
  },
  {
    n: '02', title: 'Keyword traps',
    body: 'Legacy ATS engines match strings, not skills. Strong candidates are filtered out by vocabulary rather than ability.',
  },
  {
    n: '03', title: 'Zero privacy',
    body: 'Names, emails and phone numbers flow straight into third-party models with no scrubbing and no audit trail.',
  },
];

export default function ChapterProblem() {
  const ref = useRef(null);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set('[data-rv]', { opacity: 1, y: 0 });
        return;
      }
      gsap.fromTo('[data-rv]', { opacity: 0, y: 36 }, {
        opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.12,
        scrollTrigger: { trigger: ref.current, start: 'top 70%', once: true },
      });
      // cards rise with a whisper of rotation for an organic feel
      gsap.fromTo('.pain-card',
        { opacity: 0, y: 44, rotation: 0.8 },
        {
          opacity: 1, y: 0, rotation: 0, duration: 0.9, ease: 'power3.out', stagger: 0.1,
          scrollTrigger: { trigger: '.pain-grid', start: 'top 82%', once: true },
        });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section className="chapter" id="problem" ref={ref}>
      <div className="wrap">
        <span className="chapter-tag" data-rv>01 · The problem</span>
        <h2 className="chapter-title">
          <SplitWords text="Hiring runs on a black box." />
        </h2>
        <p className="chapter-lead" data-rv>
          Resumes get rejected. <b>Nobody can say why.</b> Traditional ATS engines are opaque.
          A silent algorithm, a keyword trap, a guessed verdict with no receipt. Add AI and it
          usually gets worse: scores with <b>no transparency, no evidence and no privacy.</b>
        </p>
        <div className="pain-grid">
          {PAINS.map((p) => (
            <div className="pain-card" key={p.n}>
              <span className="num">{p.n}</span>
              <h3>{p.title}</h3>
              <p>{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
