/**
 * Shared atmospheric backdrop: ember/gold orbs, fog banks and a star field,
 * fixed behind all content.
 *
 * Everything is painted as background layers on ONE static element, and nothing
 * here animates. That is deliberate and hard-won: earlier versions stacked seven
 * large divs that animated opacity, and on hybrid-graphics laptops (Intel iGPU +
 * discrete, e.g. an HP ZBook) Chromium tore them as flickering black hairlines.
 * Tuning filters, layer promotion and animated properties did not fix it —
 * removing the composited layers did. If you add motion here, test on hybrid
 * graphics before assuming it is free.
 *
 * Star positions are generated deterministically so server and client markup
 * match (no hydration drift).
 */

// Deterministic pseudo-random star field (seeded LCG), baked into a single
// background-image declaration so the stars cost no extra elements.
const STAR_LAYERS: string = (() => {
  let seed = 1337;
  const rand = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
  return Array.from({ length: 60 }, () => {
    const top = (rand() * 100).toFixed(2);
    const left = (rand() * 100).toFixed(2);
    const size = (0.6 + rand() * 0.9).toFixed(2);
    const alpha = (0.25 + rand() * 0.5).toFixed(2);
    return `radial-gradient(circle ${size}px at ${left}% ${top}%, rgba(232,224,207,${alpha}), transparent 100%)`;
  }).join(", ");
})();

/**
 * Orbs and fog. `closest-side` makes each gradient reach full transparency
 * exactly at its own box, so no hard seam can form at an edge.
 */
const ATMOSPHERE = [
  // Ember glow, upper left
  "radial-gradient(closest-side, rgba(220,38,38,0.20), transparent) no-repeat -8% -18% / 42rem 42rem",
  // Gold glow, lower right
  "radial-gradient(closest-side, rgba(212,175,55,0.14), transparent) no-repeat 108% 112% / 44rem 44rem",
  // Cold void glow, mid left
  "radial-gradient(closest-side, rgba(26,16,42,0.65), transparent) no-repeat 2% 52% / 32rem 32rem",
  // Low fog bank
  "radial-gradient(closest-side, rgba(178,178,205,0.14), transparent) no-repeat 40% 108% / 150% 70vh",
  // Mid fog bank
  "radial-gradient(closest-side, rgba(158,158,190,0.10), transparent) no-repeat -10% 26% / 130% 52vh",
  // Upper-right fog wisp
  "radial-gradient(closest-side, rgba(150,150,185,0.08), transparent) no-repeat 108% 52% / 115% 46vh",
].join(", ");

export default function Backdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      style={{ background: `${STAR_LAYERS}, ${ATMOSPHERE}` }}
    />
  );
}
