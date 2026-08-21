import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function Magnetic({ children, strength = 0.35 }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(hover: none)').matches) return;
    const xTo = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3' });

    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const px = e.clientX - (r.left + r.width / 2);
      const py = e.clientY - (r.top + r.height / 2);
      xTo(px * strength); yTo(py * strength);
    };
    const onLeave = () => { xTo(0); yTo(0); };

    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, [strength]);

  return <div className="magnetic" ref={ref} style={{ display: 'inline-block' }}>{children}</div>;
}