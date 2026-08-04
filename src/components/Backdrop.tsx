/**
 * Star field, fixed behind all content.
 *
 * The orbs and fog banks live on the root element in globals.css because only
 * `html { background }` covers the full canvas including the scrollbar gutter.
 * A position:fixed element sized with 100vw/100vh is laid out against the visual
 * viewport, which EXCLUDES the gutter, leaving an unpainted strip on the right.
 *
 * Stars remain in a DOM element because 60 stacked gradients are easier to read
 * here than inline. Nothing here animates.
 *
 * Positions are generated deterministically so server and client markup match.
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

export default function Backdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10"
      style={{ background: STAR_LAYERS }}
    />
  );
}
