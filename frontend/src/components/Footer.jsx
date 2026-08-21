import { scrollToId } from './Nav.jsx';
import Logo from './Logo.jsx';

export default function Footer() {
  const go = (e, href) => { e.preventDefault(); scrollToId(href); };

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="footer-logo">
            <Logo size={20} />
            PRISM
          </div>
          <p>Light through glass. Every verdict proven, line by line, from the resume itself.</p>
        </div>
        <div className="footer-links">
          <div className="footer-col">
            <span className="fh">Site</span>
            <a href="#problem" onClick={(e) => go(e, '#problem')}>The problem</a>
            <a href="#solution" onClick={(e) => go(e, '#solution')}>The solution</a>
            <a href="#how" onClick={(e) => go(e, '#how')}>How it works</a>
            <a href="#analyzer" onClick={(e) => go(e, '#analyzer')}>Analyzer</a>
          </div>
          <div className="footer-col">
            <span className="fh">Project</span>
            <a href="#analyzer" onClick={(e) => go(e, '#analyzer')}>Run an analysis</a>
            <span className="fmuted">Privacy-first</span>
          </div>
        </div>
      </div>
      <div className="footer-base">
        <div className="footer-base-inner">
          <span>© 2025 PRISM</span>
        </div>
      </div>
    </footer>
  );
}
