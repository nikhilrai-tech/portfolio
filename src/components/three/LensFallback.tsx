// Static lens drawn in SVG. Shown before WebGL is ready, and instead of it when
// WebGL is missing or the visitor prefers reduced motion.
const BLADES = 9;
const C = 200;

function aperture(radius: number, rotation: number) {
  return Array.from({ length: BLADES }, (_, i) => {
    const a = rotation + (i / BLADES) * Math.PI * 2;
    return `${(C + Math.cos(a) * radius).toFixed(2)},${(C + Math.sin(a) * radius).toFixed(2)}`;
  }).join(" ");
}

function bladeSeams(inner: number, outer: number) {
  return Array.from({ length: BLADES }, (_, i) => {
    const a = (i / BLADES) * Math.PI * 2 - Math.PI / 2;
    const b = a + 0.55;
    const x1 = C + Math.cos(a) * inner;
    const y1 = C + Math.sin(a) * inner;
    const x2 = C + Math.cos(b) * outer;
    const y2 = C + Math.sin(b) * outer;
    return `M${x1.toFixed(2)} ${y1.toFixed(2)} Q ${(C + Math.cos(a + 0.4) * (inner + outer) * 0.55).toFixed(2)} ${(C + Math.sin(a + 0.4) * (inner + outer) * 0.55).toFixed(2)} ${x2.toFixed(2)} ${y2.toFixed(2)}`;
  });
}

export default function LensFallback({ className = "" }: { className?: string }) {
  const ticks = Array.from({ length: 72 }, (_, i) => (i / 72) * 360);
  return (
    <svg viewBox="0 0 400 400" className={className} role="presentation" aria-hidden>
      <defs>
        <radialGradient id="lf-barrel" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#2a3038" />
          <stop offset="100%" stopColor="#0d1014" />
        </radialGradient>
        <radialGradient id="lf-glass" cx="38%" cy="32%" r="70%">
          <stop offset="0%" stopColor="#63c7d9" stopOpacity="0.35" />
          <stop offset="45%" stopColor="#3a2a5c" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#05070a" stopOpacity="0.9" />
        </radialGradient>
        <linearGradient id="lf-sheen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.5" />
          <stop offset="40%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <circle cx={C} cy={C} r="196" fill="url(#lf-barrel)" />
      <circle cx={C} cy={C} r="196" fill="none" stroke="#3a414b" strokeWidth="2" />
      <g stroke="#4a525d" strokeWidth="2">
        {ticks.map((deg) => (
          <line
            key={deg}
            x1={C}
            y1={C - 194}
            x2={C}
            y2={C - 178}
            transform={`rotate(${deg} ${C} ${C})`}
          />
        ))}
      </g>
      <circle cx={C} cy={C} r="172" fill="#0b0e12" stroke="#eba73f" strokeWidth="3" />
      <circle cx={C} cy={C} r="160" fill="#111419" stroke="#262c34" strokeWidth="1.5" />
      <circle cx={C} cy={C} r="138" fill="#171b21" />
      <g fill="none" stroke="#2c333c" strokeWidth="1.4">
        {bladeSeams(46, 136).map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
      <polygon
        points={aperture(58, -Math.PI / 2)}
        fill="url(#lf-glass)"
        stroke="#2c333c"
        strokeWidth="1.5"
      />
      <circle cx={C} cy={C} r="138" fill="url(#lf-glass)" opacity="0.55" />
      <ellipse
        cx="150"
        cy="140"
        rx="70"
        ry="38"
        fill="url(#lf-sheen)"
        transform="rotate(-30 150 140)"
      />
      <circle cx="248" cy="252" r="5" fill="#63c7d9" opacity="0.7" />
    </svg>
  );
}
