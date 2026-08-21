/**
 * PRISM brand mark — a prism refracting a light beam into a dispersed fan.
 * Monochrome forest-green, matches the site's palette.
 */
export default function Logo({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      {/* prism body */}
      <path
        d="M16 5 L27 26 L5 26 Z"
        fill="#E4F4EC"
        stroke="#1C4839"
        strokeWidth="2.1"
        strokeLinejoin="round"
      />
      {/* incoming beam */}
      <path d="M1.5 17.6 L9.4 16.9" stroke="#2F6B53" strokeWidth="1.7" strokeLinecap="round" />
      {/* dispersed fan */}
      <path d="M22.7 16.4 L30.5 11.2" stroke="#1C4839" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M22.7 16.8 L30.5 16.9" stroke="#2F6B53" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M22.7 17.2 L30.5 22.6" stroke="#6FA88C" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}
