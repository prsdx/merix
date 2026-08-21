import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export default function AnalysisSequence({ stages, pct, error }) {
  const ref = useRef(null);
  const [fill, setFill] = useState(0);

  useEffect(() => {
    const obj = { v: 0 };
    const tw = gsap.to(obj, {
      v: pct, duration: 0.4, ease: 'power1.out',
      onUpdate: () => setFill(Math.round(obj.v)),
    });
    return () => tw.kill();
  }, [pct]);

  return (
    <div className="overlay-seq" ref={ref}>
      <div className="seq-inner">
        <div className="seq-head">{fill}%</div>
        <div className="seq-bar"><span style={{ width: `${fill}%` }} /></div>
        <div className="seq-list">
          {(stages || [{ label: 'Working…' }]).map((s, i) => {
            const done = fill >= (s.pct ?? 100);
            const active = !done && fill >= (s.pct ?? 0) - 20;
            return (
              <div className={`seq-item ${done ? 'done' : ''} ${active ? 'active' : ''}`} key={s.label}>
                <span className="seq-ic">{done ? '✔' : active ? '◌' : '○'}</span>
                <span className="seq-label">{s.label}</span>
              </div>
            );
          })}
        </div>
        {error && <div className="seq-err">{error}</div>}
        <div className="seq-sub">
          {error ? 'Analysis could not complete.' : 'This takes a few seconds. The prism is refracting your file into evidence.'}
        </div>
      </div>
    </div>
  );
}