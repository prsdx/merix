import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function fitBadge(score) {
  if (score >= 75) return { cls: 'fit-strong', label: 'Strong fit' };
  if (score >= 50) return { cls: 'fit-moderate', label: 'Moderate fit' };
  return { cls: 'fit-weak', label: 'Weak fit' };
}

function useCountUp(target) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const obj = { v: 0 };
    const tw = gsap.to(obj, {
      v: target, duration: 1.6, ease: 'power3.out',
      scrollTrigger: { trigger: '.results-hero', start: 'top 75%', once: true },
      onUpdate: () => setVal(Math.round(obj.v)),
    });
    return () => tw.kill();
  }, [target]);
  return val;
}

function Accordion({ title, sub, evidence, meta, level }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`item ${open ? 'open' : ''}`}>
      <button className="item-head" onClick={() => setOpen(o => !o)} data-cursor="">
        <span className="t">
          {title}
          {meta && <span style={{ marginLeft: '.6rem', color: 'var(--text-3)', fontWeight: 400 }}>{meta}</span>}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '.7rem' }}>
          {level && <span className={`level ${level}`}>{level === 'hi' ? 'STRONG' : level === 'md' ? 'MOD' : 'WEAK'}</span>}
          <span className="s">{sub}</span>
          <span className="chev">▾</span>
        </span>
      </button>
      <div className="item-ev" ref={(node) => { if (node) node.style.maxHeight = open ? `${node.scrollHeight}px` : '0px'; }}>
        <div className="item-ev-inner">{evidence}</div>
      </div>
    </div>
  );
}

function ScoreRing({ score }) {
  const C = 2 * Math.PI * 82;
  const val = useCountUp(score);
  const frac = val / 100;
  return (
    <div className="score-ring">
      <svg viewBox="0 0 190 190">
        <circle className="ring-bg" cx="95" cy="95" r="82" />
        <circle className="ring-val" cx="95" cy="95" r="82"
          strokeDasharray={C} strokeDashoffset={C * (1 - frac)} />
      </svg>
      <div className="score-num"><b>{val}</b><span>/ 100 · fit</span></div>
    </div>
  );
}

function Pills({ items, cls }) {
  return (
    <div className="pills">
      {items.map(it => (
        <span className={`pill ${cls}`} key={it.id || it.name} data-cursor="">{it.name}</span>
      ))}
      {items.length === 0 && <span className="pill miss">— none required —</span>}
    </div>
  );
}

export default function Results({ data, onReset }) {
  const badge = fitBadge(data.score);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set('[data-rv]', { opacity: 1, y: 0 });
        return;
      }
      gsap.utils.toArray('[data-rv]').forEach((el) => {
        gsap.fromTo(el, { opacity: 0, y: 36 }, {
          opacity: 1, y: 0, duration: 0.85, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        });
      });
      // fit badge springs in beside the ring
      gsap.fromTo('.fit-badge',
        { opacity: 0, scale: 0.85 },
        {
          opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.8)', delay: 0.5,
          scrollTrigger: { trigger: '.results-hero', start: 'top 78%', once: true },
        });
      // evidence rows cascade
      gsap.fromTo('.results-block .item',
        { opacity: 0, y: 18 },
        {
          opacity: 1, y: 0, duration: 0.55, ease: 'power2.out', stagger: 0.05,
          scrollTrigger: { trigger: '.results-wrap', start: 'top 72%', once: true },
        });
    });
    return () => ctx.revert();
  }, []);

  return (
    <section className="results-section" data-heading="results">
      <div className="results-wrap">
        <div className="results-hero">
          <ScoreRing score={data.score} />
          <div className="results-hero-side">
            <span className={`fit-badge ${badge.cls}`}>● {badge.label}</span>
            <p style={{ maxWidth: 320, fontSize: '.9rem', textAlign: 'center', color: 'var(--text-3)' }}>
              An evidence-grounded, explainable verdict. Every point maps to a line in the resume.
            </p>
          </div>
        </div>

        {data.skills_required?.length > 0 && (
          <div className="results-block">
            <div className="rb-tag" data-rv>Required skills</div>
            <div data-rv><Pills items={data.skills_required} cls="req" /></div>
            <div style={{ marginTop: '1rem' }} data-rv>
              {data.skills_required.map(it => <Accordion key={it.id} title={it.name} evidence={it.evidence} />)}
            </div>
          </div>
        )}

        {data.skills_preferred?.length > 0 && (
          <div className="results-block">
            <div className="rb-tag" data-rv>Preferred skills</div>
            <div data-rv><Pills items={data.skills_preferred} cls="pref" /></div>
            <div style={{ marginTop: '1rem' }} data-rv>
              {data.skills_preferred.map(it => <Accordion key={it.id} title={it.name} evidence={it.evidence} />)}
            </div>
          </div>
        )}

        {data.skills_missing?.length > 0 && (
          <div className="results-block">
            <div className="rb-tag" data-rv>Not evidenced</div>
            <div data-rv><Pills items={data.skills_missing} cls="miss" /></div>
          </div>
        )}

        <div className="results-block">
          <div className="rb-tag" data-rv>Experience &amp; Education</div>
          {[...(data.experiences || []), ...(data.educations || [])].map(it => (
            <div data-rv key={it.id}>
              <Accordion title={it.name} sub={it.sub} meta={it.meta} level={it.level} evidence={it.evidence} />
            </div>
          ))}
        </div>

        {data.risks?.length > 0 && (
          <div className="results-block">
            <div className="rb-tag" data-rv>Risk signals</div>
            <div data-rv>
              {data.risks.map((r, i) => <div className="risk-item" key={i}><span className="ri">⚠</span><span>{r}</span></div>)}
            </div>
          </div>
        )}

        <div className="results-actions" data-rv>
          <button className="btn btn-ghost" onClick={onReset}>← Start a new analysis</button>
        </div>
      </div>
    </section>
  );
}