import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitWords from './SplitWords.jsx';

gsap.registerPlugin(ScrollTrigger);

const PRINCIPLES = [
  {
    num: 'Principle 01', title: 'Transparent',
    body: 'Every point of the score maps to a concrete, quoted line from the resume. Nothing is guessed and nothing is hidden.',
  },
  {
    num: 'Principle 02', title: 'Evidence-grounded',
    body: 'The model is forbidden from hallucinating. It pulls only what is explicitly present, with verbatim snippets as proof.',
  },
  {
    num: 'Principle 03', title: 'Privacy-first',
    body: 'Names, emails, phones, URLs and locations are scrubbed before anything touches the AI. The resume the model sees is clean.',
  },
];

export default function ChapterSolution() {
  const ref = useRef(null);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set('[data-rv]', { opacity: 1, y: 0 });
        return;
      }
      gsap.fromTo('[data-rv]', { opacity: 0, y: 36 }, {
        opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.14,
        scrollTrigger: { trigger: ref.current, start: 'top 72%', once: true },
      });
      gsap.fromTo('.principle',
        { opacity: 0, y: 44, rotation: 0.8 },
        {
          opacity: 1, y: 0, rotation: 0, duration: 0.9, ease: 'power3.out', stagger: 0.1,
          scrollTrigger: { trigger: '.principles', start: 'top 82%', once: true },
        });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section className="chapter alt" id="solution" ref={ref}>
      <div className="wrap">
        <span className="chapter-tag" data-rv>02 · The solution</span>
        <h2 className="chapter-title">
          <SplitWords text="No more guesswork." /> <SplitWords text="Just proof." em />
        </h2>
        <p className="chapter-lead" data-rv>
          PRISM is a hiring assistant that opens the box. It scores candidates out of 100,
          and <b>proves every claim it makes</b> by holding each verdict to three principles.
        </p>
        <div className="principles">
          {PRINCIPLES.map((p) => (
            <div className="principle" key={p.num}>
              <span className="num">{p.num}</span>
              <h3>{p.title}</h3>
              <p>{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
