import { Fragment, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Masked word-by-word reveal. Each word sits in an overflow-hidden mask and
 * slides up into place with a soft stagger — the signature "editorial" entrance.
 *
 * Props:
 *  - text: string to split
 *  - em: render in italic accent (matches `.chapter-title em` / hero em styling)
 *  - manual: skip self-animation (parent animates `.sw-w` itself, e.g. Hero)
 */
export default function SplitWords({ text, em = false, manual = false }) {
  const ref = useRef(null);

  useEffect(() => {
    if (manual) return;
    const el = ref.current;
    const words = el.querySelectorAll('.sw-w');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(words, { y: 0 });
      return;
    }
    const ctx = gsap.context(() => {
      gsap.to(words, {
        y: 0, duration: 0.9, ease: 'power4.out', stagger: 0.04,
        scrollTrigger: { trigger: el, start: 'top 84%', once: true },
      });
    }, ref);
    return () => ctx.revert();
  }, [text, manual]);

  const words = text.split(' ');
  return (
    <span ref={ref} className={`sw ${em ? 'sw-em' : ''}`}>
      {words.map((w, i) => (
        <Fragment key={i}>
          <span className="sw-mask"><span className="sw-w">{w}</span></span>
          {i < words.length - 1 ? ' ' : ''}
        </Fragment>
      ))}
    </span>
  );
}
