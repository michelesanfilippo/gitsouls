/**
 * Atmospheric backdrop: ember/gold orbs, fog banks and a star field, fixed
 * behind all content.
 *
 * Sized `w-screen`/`h-screen` (i.e. 100vw × 100vh) rather than pinned with
 * `inset-0`. That is the important detail: 100vw *includes* the width of the
 * scrollbar gutter reserved in globals.css, while a fixed element pinned to
 * inset-0 is laid out against the viewport excluding it — which left an
 * unpainted strip down the right edge that read as the page being cut off.
 *
 * Nothing here animates, and there are no blur() or backdrop-filter
 * declarations. On hybrid-graphics laptops, animating large composited layers
 * here tore as flickering black hairlines; see CONTRIBUTING.md.
 *
 * Star positions are generated deterministically so server and client markup
 * match (no hydration drift).
 */

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
      className="pointer-events-none fixed left-0 top-0 -z-10 h-screen w-screen overflow-hidden"
      style={{ background: `${STAR_LAYERS}, ${ATMOSPHERE}` }}
    />
  );
}
