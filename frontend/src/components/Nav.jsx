import { useEffect, useState } from 'react';
import Logo from './Logo.jsx';

export function scrollToId(href) {
  const el = document.querySelector(href);
  if (!el) return;
  if (window.__lenis) window.__lenis.scrollTo(el, { offset: -70 });
  else el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

const LINKS = [
  { href: '#problem', label: 'Problem' },
  { href: '#solution', label: 'Solution' },
  { href: '#how', label: 'How it works' },
];

const SECTION_IDS = ['problem', 'solution', 'how', 'analyzer'];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [active, setActive] = useState('');

  // hide on scroll down / reveal on scroll up
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 16);
      setHidden(y > 140 && y > last);
      last = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // active section highlighting
  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) setActive(en.target.id); });
    }, { rootMargin: '-40% 0px -55% 0px' });
    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  return (
    <header className={`nav ${scrolled ? 'scrolled' : ''} ${hidden ? 'nav-hidden' : ''}`}>
      <div className="nav-inner">
        <a
          className="nav-brand"
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            if (window.__lenis) window.__lenis.scrollTo(0);
            else window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <Logo size={24} />
          PRISM
        </a>
        <nav className="nav-links" aria-label="Primary">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={active === l.href.slice(1) ? 'active' : ''}
              onClick={(e) => { e.preventDefault(); scrollToId(l.href); }}
            >
              {l.label}
            </a>
          ))}
        </nav>
        <a
          className="btn btn-primary btn-sm nav-cta"
          href="#analyzer"
          onClick={(e) => { e.preventDefault(); scrollToId('#analyzer'); }}
        >
          Try the analyzer
        </a>
      </div>
    </header>
  );
}
