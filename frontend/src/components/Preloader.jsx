import { useEffect, useRef, useState } from 'react';
import Logo from './Logo.jsx';

export default function Preloader({ onDone }) {
  const [pct, setPct] = useState(0);
  const rootRef = useRef(null);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const duration = reduced ? 350 : 1600;
    const start = performance.now();
    let raf;
    const step = (now) => {
      const el = now - start;
      const v = Math.min(100, Math.round((el / duration) * 100));
      setPct(v);
      if (v < 100) {
        raf = requestAnimationFrame(step);
      } else {
        setTimeout(() => {
          rootRef.current?.classList.add('leave');
          setTimeout(onDone, 700);
        }, 200);
      }
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="preloader" ref={rootRef}>
      <div className="pre-top">
        <span className="pre-brand">
          <Logo size={16} />
          PRISM
        </span>
        <span className="pre-tag">Evidence-grounded hiring</span>
      </div>
      <div className="pre-counter">{pct}</div>
      <div className="pre-line"><span style={{ width: `${pct}%` }} /></div>
    </div>
  );
}
