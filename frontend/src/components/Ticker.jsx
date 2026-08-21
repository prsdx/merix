const ITEMS = [
  'Transparent',
  'Evidence-grounded',
  'Privacy-first',
  'Auditable',
  'Explainable scoring',
  'Verbatim proof',
];

export default function Ticker() {
  return (
    <div className="ticker" aria-hidden="true">
      <div className="ticker-track">
        {[0, 1].map((copy) => (
          <div className="ticker-group" key={copy}>
            {ITEMS.map((t) => (
              <span className="ticker-item" key={t}>
                {t}
                <span className="ticker-dot" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
